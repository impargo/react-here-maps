import 'whatwg-fetch'
import '@here/maps-api-for-javascript'
import '@testing-library/jest-dom'

import { TextDecoder, TextEncoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })
