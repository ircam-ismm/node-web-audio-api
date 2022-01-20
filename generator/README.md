# Notes



## Consider only `AudioNode`

e.g. `GainNode`

```idl
[Exposed=Window]
interface GainNode : AudioNode {
  constructor (BaseAudioContext context, optional GainOptions options = {});
  readonly attribute AudioParam gain;
};

dictionary GainOptions : AudioNodeOptions {
  float gain = 1.0;
};
```

- `Exposed=Window` means add to module `exports`
- extends `AudioNode` means
    + add a `if` condition to `connect` and `disconnect` methods
- readonly attribute AudioParam gain;


=> means we need something like:

```
AudioNode {
    name, // Napi${native}
    slug, // filename, mod
    idlAttributes: [{ name: getterName }],
    primitiveAttributes: [],
    methods: [],
    idlDeps: [], // from `idlAttributes` and methods arguments
}

audioNodes.push(AudioNode); // exports, connect, disconnect, audioParams
```

### Exclude special audio nodes

AudioDestinationNode
Listener (?)

## Imports

```rs
use std::rc::Rc;

use napi::*;
use napi_derive::js_function;

use web_audio_api::node::{AudioNode, ${nativeStructName}};

use crate::audio_context::NapiAudioContext;
${audioParam.length > 0 ?
`use crate::audio_param::{NapiAudioParam, ParamGetter};`
: ``}
${idlDeps.length > 0 ? idlDeps.each(dep => )
// e.g. AudioBuffer for AudioBufferSourceNode
}
```

## Struct

```rs
pub(crate) struct ${napiStructName}(Rc<${nativeStructName}>);

impl ${napiStructName} {
    pub fn create_js_class(env: &Env) -> Result<JsFunction> {
        env.define_class(
            "${nativeStructName}",
            constructor,
            &[Property::new("connect")?.with_method(connect)],
            // primitive attributes
            ${properties.map(p => propDefTemplate(p))}
            // idl attributes (e.g. AudioParam) are defined in ctor
        )
    }

    pub fn unwrap(&self) -> &${nativeStructName} {
        &self.0
    }
}
```

## Ctor

```rs
#[js_function(1)]
fn constructor(ctx: CallContext) -> Result<JsUndefined> {
    let mut js_this = ctx.this_unchecked::<JsObject>();

    let js_audio_context = ctx.get::<JsObject>(0)?;
    let napi_audio_context = ctx.env.unwrap::<NapiAudioContext>(&js_audio_context)?;
    let audio_context = napi_audio_context.unwrap();

    js_this.set_named_property("Symbol.toStringTag", ctx.env.create_string("${nativeStructName}")?)?;

    let native_node = Rc::new(${nativeStructName}::new(audio_context, Default::default()));

    // AudioParams
    ${audioParams.map((param) => {
        let native_clone = native_node.clone();
        let param_getter = ParamGetter::${param.getterName}(native_clone);
        let napi_param = NapiAudioParam::new(param_getter);
        let mut js_obj = NapiAudioParam::create_js_object(ctx.env)?;
        ctx.env.wrap(&mut js_obj, napi_param)?;
        js_this.set_named_property("${param.name}", &js_obj)?;
    })}

    // finalize instance creation
    let napi_node = ${napiStructName}(native_node);
    ctx.env.wrap(&mut js_this, napi_node)?;

    ctx.env.get_undefined()
}
```

