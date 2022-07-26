/**
 * The file enables `@/store/index.js` to import all vuex modules
 * in a one-shot manner. There should not be any reason to edit this file.
 */

import camera from './camera'
import user from './user'
import face from './face'

export default {
  camera,
  user,
  face
}
