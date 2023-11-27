# prepare RPi

- install rust
  + [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)
  + `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  
Note: for RP4 w/ 32 bit system, choose custom installation

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

- install dev libs
  + `sudo apt-get install -y libjack-jackd2-dev`
  + `sudo apt-get install -y libasound2-dev`

- [ ] try to remove 
node-web-audio-api.linux-arm-gnueabihf.node: ELF 32-bit LSB shared object, ARM, EABI5 version 1 (SYSV), dynamically linked, BuildID[sha1]=5e4e7e318cc2f92e8d15364d5f8350187b250ae1, with debug_info, not stripped
