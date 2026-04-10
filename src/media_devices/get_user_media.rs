use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::media_devices::{
    get_user_media_sync, MediaStreamConstraints, MediaTrackConstraints,
};

use crate::media_streams::media_stream::MediaStream;

#[allow(dead_code)]
#[napi]
pub fn napi_get_user_media(options: Option<Object>) -> Result<MediaStream> {
    if options.is_none() {
        return Err(napi::Error::from_reason(
            "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': audio must be requested".to_string(),
        ));
    }

    let options = options.unwrap();

    if options.has_own_property("video")? {
        return Err(napi::Error::from_reason(
            "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': video not supported"
                .to_string(),
        ));
    }

    let constraints_options = options.get::<Object>("audio");
    if constraints_options.is_err() {
        return Err(napi::Error::from_reason(
            "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': audio must be requested".to_string(),
        ));
    }

    let constraints_options = constraints_options.unwrap();

    let constraints = match constraints_options {
        Some(constraints_options) => {
            let mut constraints = MediaTrackConstraints::default();

            let device_id = constraints_options.get::<String>("deviceId").unwrap();
            constraints.device_id = device_id;

            let sample_rate = constraints_options.get::<f64>("sampleRate").unwrap_or(None);
            match sample_rate {
                Some(sample_rate) => constraints.sample_rate = Some(sample_rate as f32),
                None => constraints.sample_rate = None,
            }

            let latency = constraints_options.get::<f64>("latency").unwrap_or(None);
            constraints.latency = latency;

            let channel_count = constraints_options
                .get::<u32>("channelCount")
                .unwrap_or(None);
            constraints.channel_count = channel_count;

            MediaStreamConstraints::AudioWithConstraints(constraints)
        }
        None => {
            return Err(napi::Error::from_reason(
                "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': audio must be requested".to_string(),
            ));
        }
    };

    let stream = get_user_media_sync(constraints);
    let napi_stream = MediaStream::new(stream);

    Ok(napi_stream)
}
