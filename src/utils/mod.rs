use napi::{Env, JsFunction, JsObject, Result};

// alternative implementation of Napi ThreadsafeFunction
// cf. https://github.com/parcel-bundler/lightningcss/blob/master/napi/src/threadsafe_function.rs
mod thread_safe_function;
pub(crate) use thread_safe_function::*;

pub(crate) fn get_class_ctor(env: &Env, name: &str) -> Result<JsFunction> {
    let store_ref: &mut napi::Ref<()> = env.get_instance_data()?.unwrap();
    let store: JsObject = env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property(name)?;
    Ok(ctor)
}
