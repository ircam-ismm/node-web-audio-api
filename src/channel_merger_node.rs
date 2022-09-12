// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
//    - WARNING - DO NOT EDIT                               - //
//    - This file has been generated                        - //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

use crate::*;
use napi_derive::js_function;
use std::rc::Rc;
use web_audio_api::node::*;

pub(crate) struct NapiChannelMergerNode(Rc<ChannelMergerNode>);

impl NapiChannelMergerNode {
    pub fn create_js_class(env: &napi::Env) -> napi::Result<napi::JsFunction> {
        env.define_class(
            "ChannelMergerNode",
            constructor,
            &[
                // Attributes

                // Methods

                // AudioNode interface
                napi::Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(napi::PropertyAttributes::Enumerable),
                // napi::Property::new("disconnect")?.with_method(disconnect),
            ],
        )
    }

    pub fn unwrap(&self) -> &ChannelMergerNode {
        &self.0
    }
}

#[js_function(2)]
fn constructor(ctx: napi::CallContext) -> napi::Result<napi::JsUndefined> {
    let mut js_this = ctx.this_unchecked::<napi::JsObject>();

    // first argument is always AudioContext
    let js_audio_context = ctx.get::<napi::JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.define_properties(&[
        napi::Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(napi::PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        napi::Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("ChannelMergerNode")?)
            .with_property_attributes(napi::PropertyAttributes::Static),
    ])?;

    // parse options

    let options = match ctx.try_get::<napi::JsObject>(1)? {
        napi::Either::A(options_js) => {
            let some_number_of_inputs_js =
                options_js.get::<&str, napi::JsNumber>("numberOfInputs")?;
            let number_of_inputs = if let Some(number_of_inputs_js) = some_number_of_inputs_js {
                number_of_inputs_js.get_double()? as usize
            } else {
                6
            };

            ChannelMergerOptions {
                number_of_inputs,
                channel_config: ChannelConfigOptions::default(),
            }
        }
        napi::Either::B(_) => {
            return Err(napi::Error::from_reason(
                "Options are mandatory for node ChannelMergerNode".to_string(),
            ));
        }
    };

    let native_node = Rc::new(ChannelMergerNode::new(audio_context, options));

    // finalize instance creation
    let napi_node = NapiChannelMergerNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiChannelMergerNode);
// disconnect_method!(NapiChannelMergerNode);

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

// -------------------------------------------------
// METHODS
// -------------------------------------------------
