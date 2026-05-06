// use napi::bindgen_prelude::*;
use std::sync::Arc;

use napi_derive::napi;

use web_audio_api::AudioPlaybackStats;

#[derive(Clone)]
#[napi]
pub struct NapiAudioPlaybackStats {
    pub(crate) inner: Arc<AudioPlaybackStats>,
}

impl NapiAudioPlaybackStats {
    pub(crate) fn new(audio_playback_stats: AudioPlaybackStats) -> Self {
        Self {
            inner: Arc::new(audio_playback_stats),
        }
    }
}

// interface AudioPlaybackStats {
//     readonly attribute double underrunDuration;
//     readonly attribute unsigned long underrunEvents;
//     readonly attribute double totalDuration;
//     readonly attribute double averageLatency;
//     readonly attribute double minimumLatency;
//     readonly attribute double maximumLatency;
//     undefined resetLatency();
//     [Default] object toJSON();
// };

#[napi]
impl NapiAudioPlaybackStats {
    #[napi(getter, js_name = "underrunDuration")]
    pub fn underrun_duration(&self) -> f64 {
        self.inner.underrun_duration()
    }

    #[napi(getter, js_name = "underrunEvents")]
    pub fn underrun_events(&self) -> f64 {
        self.inner.underrun_events() as f64
    }

    #[napi(getter, js_name = "totalDuration")]
    pub fn total_duration(&self) -> f64 {
        self.inner.total_duration()
    }

    #[napi(getter, js_name = "averageLatency")]
    pub fn average_latency(&self) -> f64 {
        self.inner.average_latency()
    }

    #[napi(getter, js_name = "minimumLatency")]
    pub fn minimum_latency(&self) -> f64 {
        self.inner.minimum_latency()
    }

    #[napi(getter, js_name = "maximumLatency")]
    pub fn maximum_latency(&self) -> f64 {
        self.inner.maximum_latency()
    }

    #[napi(js_name = "resetLatency")]
    pub fn reset_latency(&self) {
        self.inner.reset_latency()
    }

    // toJSON is implemented on JS side only
}
