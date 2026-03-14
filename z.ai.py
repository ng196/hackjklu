import argparse
import base64
import json
import os
import threading
import time
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

import httpx

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8787
DEFAULT_CHAT_MODEL = "glm-4.5-air"
DEFAULT_TRANSCRIPTION_MODEL = "glm-asr-2512"
ZAI_CHAT_COMPLETIONS_URL = "https://api.z.ai/api/coding/paas/v4/chat/completions"
ZAI_TRANSCRIPTION_URL = "https://api.z.ai/api/coding/paas/v4/audio/transcriptions"
MAX_RPM = 5
MAX_SESSION_HISTORY = 10
GLOBAL_SYSTEM_PROMPT = (
    "Always reply in English unless the user explicitly asks for another language. "
    "Do not provide adultery/infidelity guidance or explicit sexual content. "
    "Keep replies concise to minimize token usage and cost."
)

MODEL_ALIASES: dict[str, str] = {}


class UpstreamAPIError(Exception):
    def __init__(self, message: str, status_code: int, details: Any = None):
        super().__init__(message)
        self.status_code = status_code
        self.details = details


def env_api_key() -> str:
    """Read API key from environment using common names."""
    return (
        os.getenv("ZAI_API_KEY")
        or os.getenv("z.ai_api_key")
        or os.getenv("Z_AI_API_KEY")
        or ""
    ).strip()


def make_client(_api_key: str) -> Any:
    # A reusable HTTP client keeps connections warm for lower latency.
    return httpx.Client(
        limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
        timeout=httpx.Timeout(timeout=300.0, connect=8.0),
    )


def parse_json_body(handler: BaseHTTPRequestHandler) -> dict[str, Any]:
    content_length = int(handler.headers.get("Content-Length", "0"))
    if content_length <= 0:
        return {}

    raw = handler.rfile.read(content_length)
    if not raw:
        return {}

    try:
        return json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON body: {exc}") from exc


def decode_audio_payload(audio_base64: str) -> bytes:
    try:
        return base64.b64decode(audio_base64, validate=True)
    except Exception as exc:
        raise ValueError("audio_base64 is not valid base64") from exc


def normalize_chat_model(model: Any) -> str:
    requested = str(model or "").strip().lower()
    if not requested:
        return DEFAULT_CHAT_MODEL

    return MODEL_ALIASES.get(requested, requested)


def enforce_rate_limit(app_state: dict[str, Any]) -> tuple[bool, int]:
    """Simple sliding-window limiter. Returns (allowed, retry_after_seconds)."""
    now = time.time()
    window_start = now - 60.0

    with app_state["rate_lock"]:
        timestamps = app_state["request_timestamps"]
        while timestamps and timestamps[0] < window_start:
            timestamps.pop(0)

        if len(timestamps) >= app_state["max_rpm"]:
            retry_after = int(max(1, 60 - (now - timestamps[0])))
            return False, retry_after

        timestamps.append(now)

    return True, 0


def apply_global_prompt(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not messages:
        return [{"role": "system", "content": GLOBAL_SYSTEM_PROMPT}]

    first = messages[0]
    if first.get("role") == "system":
        merged = f"{GLOBAL_SYSTEM_PROMPT}\n\n{first.get('content', '')}".strip()
        updated = messages.copy()
        updated[0] = {"role": "system", "content": merged}
        return updated

    return [{"role": "system", "content": GLOBAL_SYSTEM_PROMPT}, *messages]


def call_chat_completions(
    client: httpx.Client,
    api_key: str,
    *,
    model: str,
    messages: list[dict[str, Any]],
    temperature: float,
    max_tokens: int,
) -> dict[str, Any]:
    response = client.post(
        ZAI_CHAT_COMPLETIONS_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        },
    )

    if response.status_code >= 400:
        details: Any = response.text
        try:
            details = response.json()
        except Exception:
            pass
        raise UpstreamAPIError(
            "Chat API request failed",
            status_code=response.status_code,
            details=details,
        )

    try:
        return response.json()
    except Exception as exc:
        raise RuntimeError("Unexpected chat response format") from exc


class ZAIProxyHandler(BaseHTTPRequestHandler):
    server_version = "ZAIProxy/1.0"

    @property
    def app_state(self) -> dict[str, Any]:
        return self.server.app_state  # type: ignore[attr-defined]

    def _set_common_headers(self, status_code: int, content_type: str = "application/json") -> None:
        self.send_response(status_code)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _write_json(self, payload: dict[str, Any], status_code: int = HTTPStatus.OK) -> None:
        self._set_common_headers(status_code)
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def _error(self, message: str, status_code: int = HTTPStatus.BAD_REQUEST) -> None:
        self._write_json({"ok": False, "error": message}, status_code)

    def do_OPTIONS(self) -> None:
        self._set_common_headers(HTTPStatus.NO_CONTENT)

    def do_GET(self) -> None:
        if self.path == "/":
            self._write_json(
                {
                    "ok": True,
                    "service": "z.ai local proxy",
                    "routes": ["GET /api/health", "POST /api/chat", "POST /api/transcribe"],
                    "limits": {"max_rpm": self.app_state["max_rpm"]},
                }
            )
            return

        if self.path == "/api/health":
            self._handle_health()
            return

        self._error("Not found", HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        if self.path == "/api/chat":
            self._handle_chat()
            return

        if self.path == "/api/transcribe":
            self._handle_transcribe()
            return

        self._error("Not found", HTTPStatus.NOT_FOUND)

    def _handle_health(self) -> None:
        client = self.app_state["client"]
        api_key = self.app_state["api_key"]
        try:
            data = call_chat_completions(
                client,
                api_key,
                model=DEFAULT_CHAT_MODEL,
                messages=[{"role": "user", "content": "ping"}],
                temperature=0,
                max_tokens=6,
            )
            model_name = data.get("model", DEFAULT_CHAT_MODEL)
            self._write_json({"ok": True, "online": True, "model": model_name})
        except Exception as exc:
            self._write_json({"ok": True, "online": False, "error": str(exc)}, HTTPStatus.OK)

    def _handle_chat(self) -> None:
        client = self.app_state["client"]
        api_key = self.app_state["api_key"]
        try:
            allowed, retry_after = enforce_rate_limit(self.app_state)
            if not allowed:
                self._write_json(
                    {
                        "ok": False,
                        "error": "Rate limit reached. Please wait and retry.",
                        "retryAfter": retry_after,
                    },
                    HTTPStatus.TOO_MANY_REQUESTS,
                )
                return

            payload = parse_json_body(self)
            message_text = payload.get("message")
            session_id = payload.get("sessionId") or payload.get("session_id") or "default"
            financial_context = payload.get("financialContext")
            raw_model = payload.get("model")
            model = normalize_chat_model(raw_model)
            temperature = payload.get("temperature", 0.75)
            max_tokens = payload.get("max_tokens", 2048)
            system_prompt = str(payload.get("systemPrompt") or "").strip()

            messages = payload.get("messages")
            if isinstance(messages, list) and messages:
                outbound_messages = messages
            else:
                if not isinstance(message_text, str) or not message_text.strip():
                    self._error("Provide either non-empty messages[] or message")
                    return

                sessions = self.app_state["sessions"]
                history = sessions.get(session_id, [])

                derived_system_prompt = system_prompt
                if not derived_system_prompt:
                    # Keep this concise so it stays stable as a reusable default contract.
                    derived_system_prompt = (
                        "You are FinWise, a practical financial assistant. "
                        "Keep answers concise and action-oriented."
                    )

                if isinstance(financial_context, dict) and financial_context:
                    ctx_json = json.dumps(financial_context, ensure_ascii=True)
                    derived_system_prompt = f"{derived_system_prompt}\n\nFinancial Context: {ctx_json}"

                outbound_messages = [{"role": "system", "content": derived_system_prompt}]
                outbound_messages.extend(history)
                outbound_messages.append({"role": "user", "content": message_text.strip()})

            data = call_chat_completions(
                client,
                api_key,
                model=model,
                messages=apply_global_prompt(outbound_messages),
                temperature=float(temperature),
                max_tokens=int(max_tokens),
            )

            # Keep a stable shape for frontend code regardless of SDK internals.
            choice = data.get("choices", [{}])[0]
            message_obj = choice.get("message", {})
            content = message_obj.get("content", "")
            if not content:
                content = "No response from model."

            if not (isinstance(messages, list) and messages):
                sessions = self.app_state["sessions"]
                history = sessions.get(session_id, [])
                history.extend(
                    [
                        {"role": "user", "content": message_text.strip()},
                        {"role": "assistant", "content": content},
                    ]
                )
                sessions[session_id] = history[-MAX_SESSION_HISTORY:]

            self._write_json(
                {
                    "ok": True,
                    "choices": [
                        {
                            "message": {
                                "role": "assistant",
                                "content": content,
                            }
                        }
                    ],
                    "model": data.get("model", model),
                    "requestedModel": raw_model,
                    "resolvedModel": model,
                    "response": content,
                    "sessionId": session_id,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }
            )
        except ValueError as exc:
            self._error(str(exc))
        except UpstreamAPIError as exc:
            proxy_status = exc.status_code if 400 <= exc.status_code < 500 else HTTPStatus.BAD_GATEWAY
            self._write_json(
                {
                    "ok": False,
                    "error": str(exc),
                    "upstreamStatus": exc.status_code,
                    "upstreamDetails": exc.details,
                },
                proxy_status,
            )
        except Exception as exc:
            self._error(str(exc), HTTPStatus.BAD_GATEWAY)

    def _handle_transcribe(self) -> None:
        api_key = self.app_state["api_key"]

        try:
            payload = parse_json_body(self)
            audio_base64 = payload.get("audio_base64")
            if not isinstance(audio_base64, str) or not audio_base64:
                self._error("audio_base64 is required")
                return

            audio_bytes = decode_audio_payload(audio_base64)
            file_name = payload.get("file_name") or "recording.wav"
            mime_type = payload.get("mime_type") or "audio/wav"
            model = payload.get("model") or DEFAULT_TRANSCRIPTION_MODEL

            data = {
                "model": model,
                "stream": "false",
            }
            files = {
                "file": (file_name, audio_bytes, mime_type),
            }

            with httpx.Client(timeout=httpx.Timeout(timeout=180.0, connect=8.0)) as client:
                response = client.post(
                    ZAI_TRANSCRIPTION_URL,
                    headers={"Authorization": f"Bearer {api_key}"},
                    data=data,
                    files=files,
                )

            if response.status_code >= 400:
                details: Any = response.text
                try:
                    details = response.json()
                except Exception:
                    pass
                raise UpstreamAPIError(
                    "Transcription request failed",
                    status_code=response.status_code,
                    details=details,
                )

            try:
                data_json = response.json()
            except Exception:
                self._error("Unexpected transcription response format", HTTPStatus.BAD_GATEWAY)
                return

            text = data_json.get("text", "")
            self._write_json({"ok": True, "text": text, "raw": data_json})

        except ValueError as exc:
            self._error(str(exc))
        except UpstreamAPIError as exc:
            proxy_status = exc.status_code if 400 <= exc.status_code < 500 else HTTPStatus.BAD_GATEWAY
            self._write_json(
                {
                    "ok": False,
                    "error": str(exc),
                    "upstreamStatus": exc.status_code,
                    "upstreamDetails": exc.details,
                },
                proxy_status,
            )
        except Exception as exc:
            self._error(str(exc), HTTPStatus.BAD_GATEWAY)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Local proxy for z.ai chat + transcription APIs")
    parser.add_argument("--host", default=DEFAULT_HOST, help="Host to bind")
    parser.add_argument("--port", default=DEFAULT_PORT, type=int, help="Port to bind")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    api_key = env_api_key()
    if not api_key:
        raise RuntimeError(
            "Missing API key. Set one of: ZAI_API_KEY, z.ai_api_key, or Z_AI_API_KEY"
        )

    client = make_client(api_key)

    server = ThreadingHTTPServer((args.host, args.port), ZAIProxyHandler)
    server.app_state = {
        "api_key": api_key,
        "client": client,
        "sessions": {},
        "request_timestamps": [],
        "rate_lock": threading.Lock(),
        "max_rpm": MAX_RPM,
    }

    print(f"z.ai proxy running at http://{args.host}:{args.port}")
    print("Endpoints: GET /api/health, POST /api/chat, POST /api/transcribe")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping z.ai proxy...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
