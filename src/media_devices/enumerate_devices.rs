use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::media_devices::{enumerate_devices_sync, MediaDeviceInfoKind};

#[allow(dead_code)]
#[napi]
pub fn napi_enumerate_devices(env: &Env) -> Vec<Object<'_>> {
    let list = enumerate_devices_sync();
    let mut napi_list = vec![];

    for d in list {
        let mut device = Object::new(env).unwrap();
        device
            .set_named_property::<String>("deviceId", d.device_id().into())
            .unwrap();
        device
            .set_named_property::<String>("label", d.label().into())
            .unwrap();

        if d.group_id().is_some() {
            device
                .set_named_property::<String>("groupId", d.group_id().unwrap().into())
                .unwrap();
        } else {
            device
                .set_named_property::<String>("groupId", "".into())
                .unwrap();
        }

        match d.kind() {
            MediaDeviceInfoKind::VideoInput => {
                device
                    .set_named_property::<String>("kind", "videoinput".into())
                    .unwrap();
            }
            MediaDeviceInfoKind::AudioInput => {
                device
                    .set_named_property::<String>("kind", "audioinput".into())
                    .unwrap();
            }
            MediaDeviceInfoKind::AudioOutput => {
                device
                    .set_named_property::<String>("kind", "audiooutput".into())
                    .unwrap();
            }
        }

        napi_list.push(device);
    }

    napi_list
}
