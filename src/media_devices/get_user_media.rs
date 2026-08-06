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

    let constraints_options = options.get::<Either<bool, Object>>("audio");
    // is Error is it doesn't match Either<bool, Object>
    if constraints_options.is_err() {
        return Err(napi::Error::from_reason(
            "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': audio must be requested".to_string(),
        ));
    }

    let constraints_options = constraints_options.unwrap();

    let constraints: MediaStreamConstraints = match constraints_options {
        Some(constraints_options) => {
            match constraints_options {
                Either::A(bool_constraint) => {
                    // explicit { audio: false } should fail
                    if !bool_constraint {
                        return Err(napi::Error::from_reason(
                            "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': audio must be requested".to_string(),
                        ));
                    }

                    MediaStreamConstraints::Audio
                }
                Either::B(constraints_options) => {
                    let mut constraints = MediaTrackConstraints::default();

                    // pub device_id: Option<String>
                    let device_id = constraints_options.get::<String>("deviceId");
                    constraints.device_id = match device_id {
                        Ok(device_id) => device_id,
                        Err(_) => {
                            return Err(napi::Error::from_reason(
                                "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': deviceId must be a string".to_string(),
                            ));
                        }
                    };

                    // pub sample_rate: Option<f32>
                    let sample_rate = constraints_options.get::<f64>("sampleRate");
                    constraints.sample_rate = match sample_rate {
                        Ok(sample_rate) => sample_rate.map(|sample_rate| sample_rate as f32),
                        Err(_) => {
                            return Err(napi::Error::from_reason(
                                "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': sampleRate must be a number".to_string(),
                            ));
                        }
                    };

                    // pub latency: Option<f64>
                    let latency = constraints_options.get::<f64>("latency");
                    constraints.latency = match latency {
                        Ok(latency) => latency,
                        Err(_) => {
                            return Err(napi::Error::from_reason(
                                "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': latency must be a number".to_string(),
                            ));
                        }
                    };

                    // pub channel_count: Option<u32>
                    let channel_count = constraints_options.get::<u32>("channelCount");
                    constraints.channel_count = match channel_count {
                        Ok(channel_count) => channel_count,
                        Err(_) => {
                            return Err(napi::Error::from_reason(
                                "TypeError -  Failed to execute 'getUserMedia' on 'MediaDevices': channelCount must be a number".to_string(),
                            ));
                        }
                    };

                    MediaStreamConstraints::AudioWithConstraints(constraints)
                }
            }
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
