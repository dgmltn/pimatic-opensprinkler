# # device configuration options
module.exports = {
  title: "pimatic-opensprinkler device config schemas"
  OpenSprinker:
    title: "OpenSprinkler device config options"
    type: "object"
    properties:
      host:
        description: "The address of OpenSprinkler device (defaults to localhost)"
        type: "string"
        default: "localhost"
      password:
        description: "OpenSprinkler password (optional)"
        type: "string"
        default: ""
}
