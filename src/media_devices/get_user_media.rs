use crate::media_streams::NapiMediaStream;

use napi::{CallContext, JsFunction, JsObject, Result};
use napi_derive::js_function;

use web_audio_api::media_devices::{get_user_media_sync, MediaStreamConstraints};

// @note: this factory pattern could be used for params as well
// so we could expose the AudioParam ctor (for the web test suite)

#[js_function(1)]
pub(crate) fn napi_get_user_media(ctx: CallContext) -> Result<JsObject> {
    // @todo - handle options
    println!("ctx.length: {:?}", ctx.length);

    // create rust stream
    let stream = get_user_media_sync(MediaStreamConstraints::Audio);
    let napi_stream = NapiMediaStream::new(stream);
    // retrieve the JS ctor and create a new instance
    let store_ref: &mut napi::Ref<()> = ctx.env.get_instance_data()?.unwrap();
    let store: JsObject = ctx.env.get_reference_value(store_ref)?;
    let ctor: JsFunction = store.get_named_property("MediaStream")?;

    // @note - this argument is pure bullshit
    let js_this = ctx.this_unchecked::<JsObject>();
    let mut js_stream = ctor.new_instance(&[js_this])?;
    // wrap JS instance and rust napi stream
    ctx.env.wrap(&mut js_stream, napi_stream)?;

    Ok(js_stream)
}
