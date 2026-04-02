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

#[napi]
pub struct NapiConstantSourceNode {
    pub(crate) inner: ConstantSourceNode,
}

audio_node_impl!(NapiConstantSourceNode);

#[napi]
impl NapiConstantSourceNode {
    // @todo - context: Either<&NapiAudioContext, &NapiOfflineAudioContext>
    #[napi(constructor)]
    pub fn new(
        mut this: This<Object>,
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // @todo - finish options handling

        // --------------------------------------------------------
        // Parse ConstantSourceOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------
        let node_defaults = ConstantSourceOptions::default();

        let some_offset = options.get::<Option<f64>>("offset").unwrap();
        let offset = if let Some(offset) = some_offset.unwrap() {
            offset as f32
        } else {
            node_defaults.offset
        };

        // --------------------------------------------------------
        // Create ConstantSourceOptions object
        // --------------------------------------------------------
        let options = ConstantSourceOptions { offset };

        // --------------------------------------------------------
        // Create native instance
        // --------------------------------------------------------
        let native_node = match context {
            Either::A(context) => {
                let native_context = context.unwrap();
                ConstantSourceNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.unwrap();
                ConstantSourceNode::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Create and bind NapiAudioParam instances
        // --------------------------------------------------------

        let native_param = native_node.offset().clone();
        let napi_param = NapiAudioParam::new(native_param);
        let _ = this.set_named_property("offset", napi_param);

        // create js instance
        Self { inner: native_node }
    }

    #[napi]
    pub fn start(&mut self, when: Option<f64>) {
        let when = when.unwrap_or(0.);
        self.inner.start_at(when);
    }

    #[napi]
    pub fn stop(&mut self, when: Option<f64>) {
        let when = when.unwrap_or(0.);
        self.inner.stop_at(when);
    }
}
