use napi::{Env, JsFunction, JsObject, JsSymbol, Result};

// alternative implementation of Napi ThreadsafeFunction
// cf. // cf. https://github.com/parcel-bundler/lightningcss/blob/master/napi/src/threadsafe_function.rs
mod thread_safe_function;
pub(crate) use thread_safe_function::*;

// cf. https://users.rust-lang.org/t/vec-f32-to-u8/21522/7
#[allow(clippy::needless_lifetimes)]
pub(crate) fn to_byte_slice<'a>(floats: &'a [f32]) -> &'a [u8] {
    unsafe { std::slice::from_raw_parts(floats.as_ptr() as *const _, floats.len() * 4) }
}

pub(crate) fn get_symbol_for(env: &Env, name: &str) -> JsSymbol {
    env.symbol_for(name).unwrap()
}

pub(crate) fn get_class_ctor(env: &Env, name: &str) -> Result<JsFunction> {
    let store_ref: &mut napi::Ref<()> = env.get_instance_data()?.unwrap();
    let store: JsObject = env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property(name)?;
    Ok(ctor)
}
