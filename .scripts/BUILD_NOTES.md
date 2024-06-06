# Prepare RPi build systems

## Install rust

[https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### RPI 4 w/ 32 system

Choose custom installation:

```
1) Proceed with installation (default)
2) Customize installation
3) Cancel installation
>2

I'm going to ask you the value of each of these installation options.
You may simply press the Enter key to leave unchanged.

Default host triple? [aarch64-unknown-linux-gnu]
armv7-unknown-linux-gnueabihf
Default toolchain? (stable/beta/nightly/none) [stable]
Profile (which tools and data to install)? (minimal/default/complete) [default]
```

## Install dev libs

```sh
sudo apt-get install -y libjack-jackd2-dev libasound2-dev
```


# Docker image

```
cd ./.scripts/docker_x86_64-unknown-linux-gnu/
docker build -t bbmmaa/build-x86_64 .
```
