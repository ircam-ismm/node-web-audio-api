mod tsfn_store;
pub(crate) use tsfn_store::*;

// cf. https://users.rust-lang.org/t/vec-f32-to-u8/21522/7
#[allow(clippy::needless_lifetimes)]
pub(crate) fn to_byte_slice<'a>(floats: &'a [f32]) -> &'a [u8] {
    unsafe { std::slice::from_raw_parts(floats.as_ptr() as *const _, floats.len() * 4) }
}
