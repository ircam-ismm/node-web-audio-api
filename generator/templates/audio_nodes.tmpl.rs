use std::rc::Rc;
use napi::*;
use napi_derive::js_function;
use web_audio_api::node::*;
use crate::*;

pub(crate) struct ${d.napiName(d.node)}(Rc<${d.name(d.node)}>);

impl ${d.napiName(d.node)} {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "${d.name(d.node)}",
            constructor,
            &[
                // Attributes
                ${d.attributes(d.node).map(attr => `Property::new("${attr.name}")?
                    .with_getter(get_${d.slug(attr)})${attr.readonly === false ? `
                    .with_setter(set_${d.slug(attr)})` : ``}
                    .with_property_attributes(PropertyAttributes::Enumerable),
                `
                ).join('')}
                // Methods
                ${d.methods(d.node).map(method => `Property::new("${method.name}")?
                    .with_method(${d.slug(method)})
                    .with_property_attributes(PropertyAttributes::Enumerable),
                `
                ).join('')}
                // AudioNode interface
                Property::new("connect")?
                    .with_method(connect)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                // Property::new("disconnect")?.with_method(disconnect),
                ${d.parent(d.node) === 'AudioScheduledSourceNode' ? `
                // AudioScheduledSourceNode interface
                Property::new("start")?
                    .with_method(start)
                    .with_property_attributes(PropertyAttributes::Enumerable),
                Property::new("stop")?.
                    with_method(stop)
                    .with_property_attributes(PropertyAttributes::Enumerable),` : ``
                }
            ]
        )
    }

    pub fn unwrap(&self) -> &${d.name(d.node)} {
        &self.0
    }
}

// ${console.log(d.node.name, d.constructor(d.node))}

#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.define_properties(&[
        Property::new("context")?
            .with_value(&js_audio_context)
            .with_property_attributes(PropertyAttributes::Enumerable),
        // this must be put on the instance and not in the prototype to be reachable
        Property::new("Symbol.toStringTag")?
            .with_value(&ctx.env.create_string("${d.name(d.node)}")?)
            .with_property_attributes(PropertyAttributes::Static),
    ])?;

    let native_node = Rc::new(${d.name(d.node)}::new(audio_context, Default::default()));
    ${d.audioParams(d.node).map((param) => {
        return `
    // AudioParam: ${d.name(d.node)}::${param.name}
    let native_clone = native_node.clone();
    let param_getter = ParamGetter::${d.name(d.node)}${d.camelcase(param)}(native_clone);
    let napi_param = NapiAudioParam::new(param_getter);
    let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
    ctx.env.wrap(&mut js_obj, napi_param)?;
    js_this.set_named_property("${param.name}", &js_obj)?;
        `;
    }).join('')}
    // finalize instance creation
    let napi_node = ${d.napiName(d.node)}(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}

// -------------------------------------------------
// AudioNode Interface
// -------------------------------------------------
connect_method!(${d.napiName(d.node)});
// disconnect_method!(${d.napiName(d.node)});
${d.parent(d.node) === 'AudioScheduledSourceNode' ?
`
// -------------------------------------------------
// AudioScheduledSourceNode Interface
// -------------------------------------------------
${d.name(d.node) !== 'AudioBufferSourceNode' ?
`#[js_function(1)]` :
`#[js_function(3)]`
}
fn start(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();
${d.name(d.node) !== 'AudioBufferSourceNode' ?
`
    if ctx.length == 0 {
        node.start();
    } else {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        node.start_at(when);
    }
` : `
    if ctx.length == 0 {
        node.start();
    } else if ctx.length == 1 {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        node.start_at(when);
    } else if ctx.length == 2 {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        let offset = ctx.get::<JsNumber>(1)?.try_into()?;
        node.start_at_with_offset(when, offset);
    } else if ctx.length == 3 {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        let offset = ctx.get::<JsNumber>(1)?.try_into()?;
        let duration = ctx.get::<JsNumber>(2)?.try_into()?;
        node.start_at_with_offset_and_duration(when, offset, duration);
    }
`}
    ctx.env.get_undefined()
}

#[js_function(1)]
fn stop(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    if ctx.length == 0 {
        node.stop();
    } else {
        let when = ctx.get::<JsNumber>(0)?.try_into()?;
        node.stop_at(when);
    };

    ctx.env.get_undefined()
}
`
: ``
}

// -------------------------------------------------
// GETTERS
// -------------------------------------------------
${d.attributes(d.node).map(attr => {
    let attrType = d.memberType(attr);
    switch (attrType) {
        case 'boolean':
            return `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsBoolean> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.${d.slug(attr, true)}();
    ctx.env.get_boolean(value)
}
            `;
            break;
        case 'float':
        case 'double':
            return `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsNumber> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.${d.slug(attr, true)}();
    ctx.env.create_double(value as f64)
}
            `;
            break;
        case 'Float32Array':
                    return `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsUnknown> {
    let js_this = ctx.this_unchecked::<JsObject>();

    if js_this.has_named_property("__${d.slug(attr)}__")? {
        Ok(js_this.get_named_property::<JsObject>("__${d.slug(attr)}__")?.into_unknown())
    } else {
        Ok(ctx.env.get_null()?.into_unknown())
    }
}
                    `;
            break;
        // IDL types
        default: {
            let idl = d.findInTree(attrType);
            let idlType = d.type(idl);

            switch (idlType) {
                case 'enum':
                    return `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsString> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = node.${d.slug(attr, true)}();
    let js_value = match value {${idl.values.map(v => `
        ${idl.name}::${d.camelcase(v.value)} => "${v.value}",`).join('')}
    };

    ctx.env.create_string(js_value)
}
                    `;
                    break;
                case 'interface':
                    return `
#[js_function(0)]
fn get_${d.slug(attr)}(ctx: CallContext) -> Result<JsUnknown> {
    let js_this = ctx.this_unchecked::<JsObject>();

    if js_this.has_named_property("__${d.slug(attr)}__")? {
        Ok(js_this.get_named_property::<JsObject>("__${d.slug(attr)}__")?.into_unknown())
    } else {
        Ok(ctx.env.get_null()?.into_unknown())
    }
}
                    `;
                    break;
                default:
                    console.log(`[WARNING] getter for ${attr} with type ${attrType}/${idlType} not parsed`);
                    break;
            }
            break;
        }
    }
}).join('')}

// -------------------------------------------------
// SETTERS
// -------------------------------------------------
${d.attributes(d.node).map(attr => {
    if (attr.readonly) return;

    let attrType = d.memberType(attr);

    switch (attrType) {
        case 'boolean':
            return `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsBoolean>(0)?.try_into()?;
    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
            `;
            break;
        case 'float':
            return `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f32;
    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
            `;
            break;
        case 'double':
            return `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let value = ctx.get::<JsNumber>(0)?.get_double()? as f64;
    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
            `;
            break;
        case 'Float32Array':
            return `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<JsTypedArray>(0)?;
    let buffer = js_obj.into_value()?;
    let buffer_ref: &[f32] = buffer.as_ref();
    // @todo - remove this vec![]
    node.set_${d.slug(attr)}(buffer_ref.to_vec());
    // weird but seems we can have twice the same owned value...
    let js_obj = ctx.get::<JsTypedArray>(0)?;
    js_this.set_named_property("__${d.slug(attr)}__", js_obj)?;

    ctx.env.get_undefined()
}
            `;
            break;

        // IDL types
        default: {
            let idl = d.findInTree(attrType);
            let idlType = d.type(idl);

            switch (idlType) {
                case 'enum':
                    return `
#[js_function(0)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let js_str = ctx.get::<JsString>(0)?;
    let uf8_str = js_str.into_utf8()?.into_owned()?;
    let value = match uf8_str.as_str() {${idl.values.map(v => `
        "${v.value}" => ${idl.name}::${d.camelcase(v.value)},`).join('')}
        _ => panic!("undefined value for ${idl.name}"),
    };

    node.set_${d.slug(attr)}(value);

    ctx.env.get_undefined()
}
                    `;
                    break
                case 'interface':
                    return `
#[js_function(1)]
fn set_${d.slug(attr)}(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    let node = napi_node.unwrap();

    let js_obj = ctx.get::<JsObject>(0)?;
    let napi_obj = ctx.env.unwrap::<${d.napiName(idl)}>(&js_obj)?;
    let obj = napi_obj.unwrap();
    node.set_${d.slug(attr)}(obj.clone());
    // store in "private" field for getter (not very clean, to review)
    js_this.set_named_property("__${d.slug(attr)}__", js_obj)?;

    ctx.env.get_undefined()
}
                    `;
                    break;
                default:
                    console.log(`[WARNING] getter for ${attr} with type ${attrType}/${idlType} not parsed`);
                    break;
            }
            break;
        }
    }
}).join('')}

// -------------------------------------------------
// METHODS
// -------------------------------------------------
${d.methods(d.node).map(method => {
if (method.idlType.idlType !== 'undefined') {
    console.log(`[WARNING] return type ${method.idlType.idlType} for method ${method.name} not parsed`);
    return '';
}

let doWriteMethodCall = true;

return `
#[js_function(${method.arguments.length})]
fn ${d.slug(method)}(ctx: CallContext) -> Result<JsUndefined> {
    let js_this = ctx.this_unchecked::<JsObject>();
    let napi_node = ctx.env.unwrap::<${d.napiName(d.node)}>(&js_this)?;
    // avoid warnings while we don't support all methods
    #[allow(unused_variables)]
    let node = napi_node.unwrap();

    ${method.arguments.map((arg, index) => {
        const memberType = d.memberType(arg);
        switch (d.memberType(arg)) {
            case 'Float32Array':
                return `
    #[allow(clippy::unnecessary_mut_passed)]
    let mut ${d.slug(arg.name)}_js = ctx.get::<JsTypedArray>(${index})?.into_value()?;
    let ${d.slug(arg.name)}: &mut [f32] = ${d.slug(arg.name)}_js.as_mut();
                `;
                break;
            default:
                console.log(`[WARNING] argument ${arg.name} for method ${method.name} with type ${memberType} not parsed`);
                doWriteMethodCall = false;
                break;

        }
        // for (let name in arg) console.log(name);
        // console.log(arg.name);
        // console.log();
        // console.log(arg.nullable);
        // console.log(arg.optionnal);
    }).join('')}

    ${doWriteMethodCall ?
    `node.${d.slug(method)}(${method.arguments.map(arg => d.slug(arg.name)).join(', ')});` :
    ``
    }

    ctx.env.get_undefined()
}
`;
}).join('')}

