// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //
//                                                                            //
//                                                                            //
//                                                                            //
//    ██╗    ██╗ █████╗ ██████╗ ███╗   ██╗██╗███╗   ██╗ ██████╗               //
//    ██║    ██║██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔════╝               //
//    ██║ █╗ ██║███████║██████╔╝██╔██╗ ██║██║██╔██╗ ██║██║  ███╗              //
//    ██║███╗██║██╔══██║██╔══██╗██║╚██╗██║██║██║╚██╗██║██║   ██║              //
//    ╚███╔███╔╝██║  ██║██║  ██║██║ ╚████║██║██║ ╚████║╚██████╔╝              //
//     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝               //
//                                                                            //
//                                                                            //
//    - This file has been generated ---------------------------              //
//                                                                            //
//                                                                            //
// -------------------------------------------------------------------------- //
// -------------------------------------------------------------------------- //

use napi::bindgen_prelude::*;
use napi_derive::napi;

use web_audio_api::node::*;

use crate::*;

#[napi(js_name = NapiMediaStreamAudioSourceNode)]
pub struct NapiMediaStreamAudioSourceNode {
    pub(crate) inner: MediaStreamAudioSourceNode,
}

audio_node_impl!(NapiMediaStreamAudioSourceNode);

#[napi]
impl NapiMediaStreamAudioSourceNode {
    // @todo - context: Either<&NapiAudioContext, &NapiOfflineAudioContext>
    #[napi(constructor)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // --------------------------------------------------------
        // Parse MediaStreamAudioSourceOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------

        #[allow(unused)]
        let node_defaults: Option<MediaStreamAudioSourceOptions> = None;

        let js_media_stream = options
            .get::<ClassInstance<MediaStream>>("mediaStream")
            .unwrap_or(None);
        let media_stream = match js_media_stream {
            Some(js_media_stream) => js_media_stream,
            None => panic!("No default value for media_stream in MediaStreamAudioSourceOptions"),
        };
        let media_stream = media_stream.inner();

        // --------------------------------------------------------
        // Create MediaStreamAudioSourceOptions object
        // --------------------------------------------------------
        let options = MediaStreamAudioSourceOptions { media_stream };

        // --------------------------------------------------------
        // Create native instance
        // --------------------------------------------------------
        let native_node = match context {
            Either::A(context) => {
                let native_context = context.unwrap();
                MediaStreamAudioSourceNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.unwrap();
                MediaStreamAudioSourceNode::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Bind NapiAudioParam instances
        // --------------------------------------------------------

        Self { inner: native_node }
    }

    // -------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------
}
