use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use napi::threadsafe_function::ThreadsafeFunction;
use uuid::Uuid;
use web_audio_api::{AudioProcessingEvent, ErrorEvent, Event, OfflineAudioCompletionEvent};

pub(crate) enum WebAudioEventType {
    Event(Event),
    ErrorEvent(ErrorEvent),
    AudioProcessingEvent(AudioProcessingEvent),
    OfflineAudioCompletionEvent(OfflineAudioCompletionEvent),
}

impl From<Event> for WebAudioEventType {
    fn from(e: Event) -> WebAudioEventType {
        WebAudioEventType::Event(e)
    }
}

impl From<ErrorEvent> for WebAudioEventType {
    fn from(e: ErrorEvent) -> WebAudioEventType {
        WebAudioEventType::ErrorEvent(e)
    }
}

impl From<AudioProcessingEvent> for WebAudioEventType {
    fn from(e: AudioProcessingEvent) -> WebAudioEventType {
        WebAudioEventType::AudioProcessingEvent(e)
    }
}

impl From<OfflineAudioCompletionEvent> for WebAudioEventType {
    fn from(e: OfflineAudioCompletionEvent) -> WebAudioEventType {
        WebAudioEventType::OfflineAudioCompletionEvent(e)
    }
}

impl WebAudioEventType {
    pub fn unwrap_event(self) -> Event {
        match self {
            WebAudioEventType::Event(e) => e,
            _ => unreachable!(),
        }
    }

    #[allow(dead_code)]
    pub fn unwrap_error_event(self) -> ErrorEvent {
        match self {
            WebAudioEventType::ErrorEvent(e) => e,
            _ => unreachable!(),
        }
    }

    #[allow(dead_code)]
    pub fn unwrap_audio_processing_event(self) -> AudioProcessingEvent {
        match self {
            WebAudioEventType::AudioProcessingEvent(e) => e,
            _ => unreachable!(),
        }
    }

    #[allow(dead_code)]
    pub fn unwrap_offline_audio_completion_event(self) -> OfflineAudioCompletionEvent {
        match self {
            WebAudioEventType::OfflineAudioCompletionEvent(e) => e,
            _ => unreachable!(),
        }
    }
}

#[derive(Clone)]
pub(crate) struct TsfnStore {
    store: Arc<Mutex<HashMap<String, ThreadsafeFunction<WebAudioEventType>>>>,
}

impl TsfnStore {
    pub fn new() -> Self {
        Self {
            store: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    // called from main thread
    pub fn add(&self, tsfn: ThreadsafeFunction<WebAudioEventType>) -> String {
        let mut store = self.store.lock().unwrap();
        let uuid = Uuid::new_v4();
        store.insert(uuid.to_string(), tsfn);

        uuid.to_string()
    }

    // We need to clean things around so that the js object can be garbage collected.
    // But we also need to wait so that the previous tsfn.call is executed.
    // This is not clean, but don't see how to implement that properly right now.
    //
    // called from EventLoop thread
    pub fn delete(&self, store_id: String) {
        std::thread::sleep(std::time::Duration::from_millis(1));
        let mut store = self.store.lock().unwrap();

        if let Some(tsfn) = store.remove(&store_id) {
            let _ = tsfn.abort();
        }
    }

    // called from EventLoop thread
    pub fn clear(&self) {
        std::thread::sleep(std::time::Duration::from_millis(1));
        let mut store = self.store.lock().unwrap();

        for (_, tsfn) in store.drain() {
            let _ = tsfn.abort();
        }
    }
}
