FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends gcc g++ python3 openjdk-17-jdk-headless time util-linux procps sudo \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 1000 vercel \
    && mkdir -p /vercel/sandbox && chown vercel:vercel /vercel/sandbox
WORKDIR /vercel/sandbox
CMD ["sleep", "infinity"]
