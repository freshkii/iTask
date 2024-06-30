ARG PYTHON_VERSION=3.12.3
FROM python:${PYTHON_VERSION}-slim as base

WORKDIR /app

ENV DOCKER_PROCESS = "1"

COPY requirements.txt .

RUN python -m pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python3", "app.py"]
