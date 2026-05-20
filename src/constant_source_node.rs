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

#[napi(js_name = NapiConstantSourceNode)]
pub struct NapiConstantSourceNode {
    pub(crate) inner: ConstantSourceNode,
    pub(crate) offset: NapiAudioParam,
}

audio_node_impl!(NapiConstantSourceNode);

#[napi]
impl NapiConstantSourceNode {
    #[napi(constructor, catch_unwind)]
    pub fn new(
        context: Either<&NapiAudioContext, &NapiOfflineAudioContext>,
        options: Object,
    ) -> Self {
        // --------------------------------------------------------
        // Parse ConstantSourceOptions
        // by bindings construction all fields are populated on the JS side
        // --------------------------------------------------------

        let node_defaults: Option<ConstantSourceOptions> = Some(ConstantSourceOptions::default());

        let some_offset = options.get::<Option<f64>>("offset").unwrap();
        let offset = if let Some(offset) = some_offset.unwrap() {
            offset as f32
        } else if node_defaults.is_some() {
            node_defaults.clone().unwrap().offset
        } else {
            panic!("No default value for offset in ConstantSourceOptions")
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
                let native_context = context.inner();
                ConstantSourceNode::new(native_context, options)
            }
            Either::B(context) => {
                let native_context = context.inner();
                ConstantSourceNode::new(native_context, options)
            }
        };

        // --------------------------------------------------------
        // Bind NapiAudioParam instances
        // --------------------------------------------------------

        let native_param = native_node.offset().clone();
        let offset = NapiAudioParam::new(native_param);

        Self {
            inner: native_node,
            offset,
        }
    }

    #[napi(getter, js_name = "offset")]
    pub fn offset(&self) -> NapiAudioParam {
        self.offset.clone()
    }

    #[napi(catch_unwind)]
    pub fn start(&mut self, when: Option<f64>) {
        let when = when.unwrap_or(0.);
        self.inner.start_at(when);
    }

    #[napi(catch_unwind)]
    pub fn stop(&mut self, when: Option<f64>) {
        let when = when.unwrap_or(0.);
        self.inner.stop_at(when);
    }

    #[napi]
    pub fn onended(&self, callback: Function<NapiEvent, ()>) -> Result<()> {
        let tsfn = callback
            .build_threadsafe_function()
            .weak::<true>() // do not prevent process to exit
            .build_callback(
                move |ctx: napi::threadsafe_function::ThreadsafeCallContext<
                    web_audio_api::Event,
                >| {
                    Ok(NapiEvent {
                        type_: ctx.value.type_.to_string(),
                    })
                },
            )?;

        self.inner.set_onended(move |e| {
            tsfn.call(
                e,
                napi::threadsafe_function::ThreadsafeFunctionCallMode::Blocking,
            );
        });

        Ok(())
    }
}
