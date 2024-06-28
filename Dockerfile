ARG PYTHON_VERSION=3.12.3
FROM python:${PYTHON_VERSION}-slim as base

WORKDIR /app

ENV DOCKER_PROCESS = "1"

COPY requirements.txt .

RUN python -m pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python3", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]