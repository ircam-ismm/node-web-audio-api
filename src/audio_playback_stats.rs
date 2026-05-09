// use napi::bindgen_prelude::*;
use std::sync::Arc;

use napi_derive::napi;

use web_audio_api::{AudioPlaybackStats, AudioPlaybackStatsSnapshot};

#[napi(object)]
pub struct NapiAudioPlaybackStatsSnapshot {
    pub underrun_duration: f64,
    pub underrun_events: f64,
    pub total_duration: f64,
    pub average_latency: f64,
    pub minimum_latency: f64,
    pub maximum_latency: f64,
}

impl From<AudioPlaybackStatsSnapshot> for NapiAudioPlaybackStatsSnapshot {
    fn from(snapshot: AudioPlaybackStatsSnapshot) -> Self {
        Self {
            underrun_duration: snapshot.underrun_duration,
            underrun_events: snapshot.underrun_events as f64,
            total_duration: snapshot.total_duration,
            average_latency: snapshot.average_latency,
            minimum_latency: snapshot.minimum_latency,
            maximum_latency: snapshot.maximum_latency,
        }
    }
}

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

    #[napi(js_name = "toJSON")]
    pub fn to_json(&self) -> NapiAudioPlaybackStatsSnapshot {
        let snapshot: AudioPlaybackStatsSnapshot = self.inner.to_json();
        NapiAudioPlaybackStatsSnapshot::from(snapshot)
    }
}
