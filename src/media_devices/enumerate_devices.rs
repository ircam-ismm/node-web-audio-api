use napi::{CallContext, JsObject, Result};
use napi_derive::js_function;
use web_audio_api::media_devices::{enumerate_devices, MediaDeviceInfoKind};

#[js_function(0)]
pub(crate) fn napi_enumerate_devices(ctx: CallContext) -> Result<JsObject> {
    let list = enumerate_devices();

    let mut napi_list = ctx.env.create_array(0)?;

    for d in list {
        let mut device = ctx.env.create_object()?;
        device.set_named_property("deviceId", ctx.env.create_string(d.device_id())?)?;
        device.set_named_property("label", ctx.env.create_string(d.label())?)?;

        if d.group_id().is_some() {
            device.set_named_property("groupId", ctx.env.create_string(d.group_id().unwrap())?)?;
        } else {
            device.set_named_property("groupId", ctx.env.create_string("")?)?;
        }

        match d.kind() {
            MediaDeviceInfoKind::VideoInput => {
                device.set_named_property("kind", ctx.env.create_string("videoinput")?)?;
            }
            MediaDeviceInfoKind::AudioInput => {
                device.set_named_property("kind", ctx.env.create_string("audioinput")?)?;
            }
            MediaDeviceInfoKind::AudioOutput => {
                device.set_named_property("kind", ctx.env.create_string("audiooutput")?)?;
            }
        }

        napi_list.insert(device)?;
    }

    napi_list.coerce_to_object()
}
