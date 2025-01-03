FROM node:20-buster
# buster means minimum GLIBC version is 2.28 (2019)

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH \
    CC=clang \
    CXX=clang++ \
    PKG_CONFIG_ALLOW_CROSS=1 \
    RUST_TARGET=x86_64-unknown-linux-gnueabi

RUN dpkg --add-architecture amd64 && \
    apt-get update && \
    apt-get install -y \
        curl \
        pkg-config \
        libasound2-dev \
        libasound2-dev:amd64 \
        libjack-jackd2-dev \
        libjack-jackd2-dev:amd64 \
        gcc \
        g++ \
        g++-x86-64-linux-gnu \
        libc6-dev \
        libc6-dev:amd64 \
        libc6-dev-amd64-cross \
        ca-certificates \
        qemu-user \
        make \
        file \
        clang \
        && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y

RUN rustup target add x86_64-unknown-linux-gnu
