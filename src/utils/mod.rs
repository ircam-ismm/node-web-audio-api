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

pub(crate) fn float_buffer_to_js(env: &Env, data: *mut f32, length: usize) -> napi::JsTypedArray {
    let data: &mut [u8] = unsafe { std::slice::from_raw_parts_mut(data as *mut _, length * 4) };
    let data_ptr = data.as_ptr() as *mut _;
    let ptr_length = data.len();

    unsafe {
        env.create_arraybuffer_with_borrowed_data(data_ptr, ptr_length, (), napi::noop_finalize)
            .map(|array_buffer| {
                array_buffer
                    .into_raw()
                    .into_typedarray(napi::TypedArrayType::Float32, length, 0)
                    .unwrap()
            })
            .unwrap()
    }
}
