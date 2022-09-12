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

pub(crate) struct NapiIIRFilterNode(Rc<IIRFilterNode>);

impl NapiIIRFilterNode {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "IIRFilterNode",
            constructor,
            &[
                // Attributes

                // Methods
                Property::new("getFrequencyResponse")?
                    .with_method(get_frequency_response)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // AudioNode interface
                Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Property::new("disconnect")?.with_method(disconnect),
            ],
        )
    }

    pub fn unwrap(&self) -> &IIRFilterNode {
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
            .with_value(&ctx.env.create_string("IIRFilterNode")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    let options = match ctx.try_get::<JsObject>(1)? {
        Either::A(options_js) => {
            let feedforward = if let Some(feedforward_js) =
                options_js.get::<&str, JsTypedArray>("feedforward")?
            {
                let feedforward_value = feedforward_js.into_value()?;
                let feedforward: &[f64] = feedforward_value.as_ref();

                feedforward.to_vec()
            } else {
                return Err(napi::Error::from_reason(
                    "Parameter feedforward is required".to_string(),
                ));
            };

            let feedback =
                if let Some(feedback_js) = options_js.get::<&str, JsTypedArray>("feedback")? {
                    let feedback_value = feedback_js.into_value()?;
                    let feedback: &[f64] = feedback_value.as_ref();

                    feedback.to_vec()
                } else {
                    return Err(napi::Error::from_reason(
                        "Parameter feedback is required".to_string(),
                    ));
                };

            IIRFilterOptions {
                feedforward,
                feedback,
                channel_config: ChannelConfigOptions::default(),
            }
        }
        Either::B(_) => {
            return Err(napi::Error::from_reason(
                "Options are mandatory for node IIRFilterNode".to_string(),
            ));
        }
    };

    let native_node = Rc::new(IIRFilterNode::new(audio_context, options));

    // finalize instance creation
    let napi_node = NapiIIRFilterNode(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(NapiIIRFilterNode);
// disconnect_method!(NapiIIRFilterNode);

// -------------------------------------------------
// GETTERS
// -------------------------------------------------

// -------------------------------------------------
// SETTERS
// -------------------------------------------------

// -------------------------------------------------
// METHODS
// -------------------------------------------------

#[js_function(3)]
fn get_frequency_response(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<NapiIIRFilterNode>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    #[allow(clippy::unnecessary_mut_passed)]
    let mut frequency_hz_js = ctx.get::<JsTypedArray>(0)?.into_value()?;
    let frequency_hz: &mut [f32] = frequency_hz_js.as_mut();

    #[allow(clippy::unnecessary_mut_passed)]
    let mut mag_response_js = ctx.get::<JsTypedArray>(1)?.into_value()?;
    let mag_response: &mut [f32] = mag_response_js.as_mut();

    #[allow(clippy::unnecessary_mut_passed)]
    let mut phase_response_js = ctx.get::<JsTypedArray>(2)?.into_value()?;
    let phase_response: &mut [f32] = phase_response_js.as_mut();

    node.get_frequency_response(frequency_hz, mag_response, phase_response);

    ctx.env.get_undefined()
}
