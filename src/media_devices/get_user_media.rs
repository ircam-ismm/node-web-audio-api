use crate::media_streams::NapiMediaStream;

use napi::{CallContext, Either, JsFunction, JsNumber, JsObject, JsString, Result};
use napi_derive::js_function;

use web_audio_api::media_devices::{
    get_user_media_sync, MediaStreamConstraints, MediaTrackConstraints,
};

// @note: this factory pattern could be used for params as well
// so we could expose the AudioParam ctor (for the web test suite)

#[js_function(1)]
pub(crate) fn napi_get_user_media(ctx: CallContext) -> Result<JsObject> {
    // we never go here, probably because monkey explictely pass undefined (?)
    if ctx.length == 0 {
        return Err(napi::Error::from_reason(
            "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': audio must be requested".to_string(),
        ));
    }

    // @todo - handle options
    let options = match ctx.try_get::<JsObject>(0)? {
        Either::A(options_js) => {
            if options_js.has_own_property("video")? {
                return Err(napi::Error::from_reason(
                    "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': video not supported".to_string(),
                ));
            }

            if let Some(js_constraints) = options_js.get::<&str, JsObject>("audio")? {
                let mut constraints = MediaTrackConstraints::default();

                if let Ok(Some(js_device_id)) = js_constraints.get::<&str, JsString>("deviceId") {
                    let device_id = js_device_id.into_utf8()?.into_owned()?;
                    constraints.device_id = Some(device_id);
                }

                if let Ok(Some(js_sample_rate)) = js_constraints.get::<&str, JsNumber>("sampleRate")
                {
                    let sample_rate = js_sample_rate.get_double()? as f32;
                    constraints.sample_rate = Some(sample_rate);
                }

                if let Ok(Some(js_latency)) = js_constraints.get::<&str, JsNumber>("latency") {
                    let latency = js_latency.get_double()?;
                    constraints.latency = Some(latency);
                }

                if let Ok(Some(js_channel_count)) =
                    js_constraints.get::<&str, JsNumber>("channelCount")
                {
                    let channel_count = js_channel_count.get_uint32()?;
                    constraints.channel_count = Some(channel_count);
                }

                MediaStreamConstraints::AudioWithConstraints(constraints)
            } else {
                return Err(napi::Error::from_reason(
                    "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': audio must be requested".to_string(),
                ));
            }
        }
        Either::B(_) => {
            return Err(napi::Error::from_reason(
                "TypeError -  Argument should be an object".to_string(),
            ));
        }
    };

    // create rust stream
    let stream = get_user_media_sync(options);
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
