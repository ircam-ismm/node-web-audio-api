import slugify from '@sindresorhus/slugify';

function slug(str) {
  return slugify(str, { separator: '_' });
}

// const buffer = fs.readFileSync('audio-param.idl');
const buffer = fs.readFileSync('gain-node.idl');
const content = buffer.toString();

const tree = parse(content);

let typeImportMap = {
  AudioParam: 'param::AudioParam',
  GainNode: 'node::GainNode',
}

function log(item) {
  console.log(JSON.stringify(item, null, 2));
}

function getNapiCtorName(name) {
  return `${slug(name)}_constructor`;
}

// return filtered list where all idl ref except AudioContext are remove
// i.e. filter Options
function filterIdlArguments(args) {
  const authorized = [
    'bool',
    'float',
    'double',
    'BaseAudioContext',
  ];

  return args.filter(attr => {
    return authorized.indexOf(attr.idlType.idlType) !== -1;
  });
}

function filterIdlPrimitiveAttributes(members) {
  const authorized = [
    'bool',
    'float',
    'double',
  ];

  return members.filter(member => {
    return member.type === 'attribute' && authorized.indexOf(member.idlType.idlType) !== -1;
  });
}

function filterIdlIdlAttributes(members) {
  const authorized = [
    'AudioDestination',
    'AudioParam',
  ];

  return members.filter(member => {
    return member.type === 'attribute' && authorized.indexOf(member.idlType.idlType) !== -1;
  });
}


function filterIdlMethods(members) {
  return members.filter(member => {
    return member.type === 'operation';
  });
}

function createNapiClass(def) {
  // @note - AudioParams should be monkey patched in ctor not accessed though getters
  const primitiveAttrs = filterIdlPrimitiveAttributes(def.members);
  const methods = filterIdlMethods(def.members);
  // @todo - get inherited mothods (deep search i.e. ScheduledSourceNode -> AudioNode)

  const code = `
use web_audio_api::${typeImportMap[def.name]};

pub(crate) struct Napi${def.name}(${def.name});

impl Napi${def.name}(${def.name}) {
  pb fn create_js_class(env: $Env) -> Result<JsFunction> {
    env.define_class(
      "${def.name}",
      ${getNapiCtorName(def.name)},
      &[${primitiveAttrs.map(attr => {
          return `
        Property::new("${attr.name}")?
          .with_getter(${slug(attr.name)})${!attr.readonly ? `.with_setter(set_${slug(attr.name)})` : ``},`
        }).join('')}
        ${methods.map(method => {
          return `
        Property::new("${method.name}")?
          .with_method(${slug(method.name)}),`
        }).join('')}
      ]
    )
  }

  pub fn unwrap(&self) -> &${def.name} {
    &self.0
  }
}
`;
  return code;
}

function createNapiCtor(def) {
  const ctor = def.members.find(attr => attr.type === 'constructor');
  const idlAttrs = filterIdlIdlAttributes(def.members);
  const args = filterIdlArguments(ctor.arguments);

  log(idlAttrs);

  const code = `
#[js_function(${args.length})]
fn ${getNapiCtorName(def.name)}(ctx: CallContext) -> Result<JsUndefined> {
  let mut this = ctx.this_unchecked::<JsObject>();

  let js_audio_content = ctx.get::<JsObject>(0)?;
  this.set_named_property("context", js_audio_context)?;

  this.set_name_property("Symbol.toStringTag", ctx.env.create_string("${def.name}")?)?;

  ${idlAttrs.map(attr => {
    return `

    `
  }).join('')}

  ctx.env.get_undefined()
}
`;

  return code;
}

function createNapiMethods(def) {

}


tree.forEach(def => {
  if (def.extAttrs.length) {
    if (def.extAttrs[0].name === 'Exposed' && def.extAttrs[0].rhs.value == 'Window') {
      const classDef = createNapiClass(def);
      const classCtor = createNapiCtor(def);
      const classMethods = createNapiMethods(def);

      console.log(classDef);
      console.log(classCtor);
    }
  }
});

