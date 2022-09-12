// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
//    - WARNING - DO NOT EDIT                               - //
//    - This file has been generated                        - //
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //

use crate::*;
use napi::*;
use napi_derive::js_function;
use std::rc::Rc;
use web_audio_api::node::*;

pub(crate) struct NapiChannelSplitterNode(Rc<ChannelSplitterNode>);

impl NapiChannelSplitterNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "ChannelSplitterNode",
            constructor,
            &[
                // Attributes

                // Methods

                // AudioNode interface
                Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Property::new("disconnect")?.with_method(disconnect),
            ],
        )
    }

    pub fn unwrap(&self) -> &ChannelSplitterNode {
        &self.0
    }
}

#[js_function(2)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    // first argument is always AudioContext
    let js_audio_context = ctx.get::<JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("ChannelSplitterNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    let options = match ctx.try_get::<JsObject>(1)? {
        Either::A(options_js) => {
            let some_number_of_outputs_js = options_js.get::<&str, JsNumber>("numberOfOutputs")?;
            let number_of_outputs = if let Some(number_of_outputs_js) = some_number_of_outputs_js {
                number_of_outputs_js.get_double()? as usize
            } else {
                6
            };

            ChannelSplitterOptions {
                number_of_outputs,
                channel_config: ChannelConfigOptions::default(),
            }
        }
        Either::B(_) => Default::default(),
    };

    let native_node = Rc::new(ChannelSplitterNode::new(audio_context, options));

    // finalize instance creation
    let napi_node = NapiChannelSplitterNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiChannelSplitterNode);
// disconnect_method!(NapiChannelSplitterNode);

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

// -------------------------------------------------
// METHODS
// -------------------------------------------------
