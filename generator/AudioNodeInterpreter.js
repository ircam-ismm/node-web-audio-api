import fs from 'fs';
import slugify from '@sindresorhus/slugify';
import compile from 'template-literal';

let audioNodeCode = fs.readFileSync('./templates/audio-node.tmpl.rs', 'utf8');
let audioNodeTmpl = compile(audioNodeCode);

class AudioNodeInterpreter {
  constructor(idl, tree) {
    this.idl = idl;
    this.tree = tree;
  }


  get name() {
    return this.idl.name;
  }

  get napiName() {
    return `Napi${this.idl.name}`
  }

  get slug() {
    return slugify(this.name, { separator: '_' });
  }

  get inherit() {
    return this.idl.inheritance;
  }

  get attributes() {
    let attrs = this.idl.members
      .filter(member => member.constructor.name === 'Attribute')
      .filter(member => member.idlType.idlType !== 'AudioParam');

    return attrs;
  }

  get methods() {
    let methods = this.idl.members
      .filter(member => member.constructor.name === 'Operation')
      .filter(member => member.name !== 'start')
      .filter(member => member.name !== 'stop')

    console.log(methods);
    return methods;
  }

  get audioParams() {
    let params = this.idl.members
      .filter(member => member.constructor.name === 'Attribute')
      .filter(member => member.idlType.idlType === 'AudioParam');

    return params;
  }

  findInTree(name) {
    return this.tree.find(l => l.name === name);
  }

  slugify(name) {
    return slugify(name, { separator: '_' });
  }

  render() {
    // this.methods
    return audioNodeTmpl(this);
  }
}

export default AudioNodeInterpreter;
