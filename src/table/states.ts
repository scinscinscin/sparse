export const states = [
  {
    "[L_BRACKET]": {
      "type": "shift",
      "value": 5
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 6
    },
    "<PROGRAM>": {
      "type": "goto",
      "value": 1
    },
    "<STATES>": {
      "type": "goto",
      "value": 2
    },
    "<ITEMS>": {
      "type": "goto",
      "value": 3
    },
    "<ITEM>": {
      "type": "goto",
      "value": 4
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 0
    }
  },
  {
    "[EOF]": {
      "type": "shift",
      "value": 7
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 2
    },
    "[L_BRACKET]": {
      "type": "shift",
      "value": 5
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 6
    },
    "<STATES>": {
      "type": "goto",
      "value": 8
    },
    "<ITEMS>": {
      "type": "goto",
      "value": 3
    },
    "<ITEM>": {
      "type": "goto",
      "value": 4
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 4
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 4
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 4
    },
    "[COMMA]": {
      "type": "shift",
      "value": 9
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 10
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 11
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 1
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 3
    }
  },
  {
    "[L_BRACKET]": {
      "type": "shift",
      "value": 5
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 6
    },
    "<ITEMS>": {
      "type": "goto",
      "value": 12
    },
    "<ITEM>": {
      "type": "goto",
      "value": 13
    }
  },
  {
    "[R_BRACKET]": {
      "type": "shift",
      "value": 14
    }
  },
  {
    "[R_ANGLE]": {
      "type": "shift",
      "value": 15
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 5
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 5
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 5
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 4
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 4
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 4
    },
    "[COMMA]": {
      "type": "shift",
      "value": 16
    }
  },
  {
    "[EQUALS]": {
      "type": "shift",
      "value": 17
    }
  },
  {
    "[EQUALS]": {
      "type": "shift",
      "value": 18
    }
  },
  {
    "[L_BRACKET]": {
      "type": "shift",
      "value": 5
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 6
    },
    "<ITEMS>": {
      "type": "goto",
      "value": 19
    },
    "<ITEM>": {
      "type": "goto",
      "value": 13
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 20
    }
  },
  {
    "[NUMBER]": {
      "type": "shift",
      "value": 21
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 5
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 5
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 5
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 6
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 6
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 6
    },
    "[COMMA]": {
      "type": "reduce",
      "value": 6
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 7
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 7
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 7
    },
    "[COMMA]": {
      "type": "reduce",
      "value": 7
    }
  }
];
    export const productions = [
  {
    "lhs": {
      "column": 1,
      "lexeme": "S",
      "line": 1,
      "type": 0
    },
    "identifier": "<S>",
    "originalProductionIndex": 0,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 6,
          "lexeme": "PROGRAM",
          "line": 1,
          "type": 0
        },
        "identifier": "<PROGRAM>",
        "name": null
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "PROGRAM",
      "line": 2,
      "type": 0
    },
    "identifier": "<PROGRAM>",
    "originalProductionIndex": 1,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 12,
          "lexeme": "STATES",
          "line": 2,
          "type": 0
        },
        "identifier": "<STATES>",
        "name": "states"
      },
      {
        "type": "terminal",
        "token": {
          "column": 29,
          "lexeme": "EOF",
          "line": 2,
          "type": 0
        },
        "identifier": "[EOF]",
        "name": null
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "STATES",
      "line": 3,
      "type": 0
    },
    "identifier": "<STATES>",
    "originalProductionIndex": 2,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 11,
          "lexeme": "ITEMS",
          "line": 3,
          "type": 0
        },
        "identifier": "<ITEMS>",
        "name": "state"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "STATES",
      "line": 3,
      "type": 0
    },
    "identifier": "<STATES>",
    "originalProductionIndex": 2,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 11,
          "lexeme": "ITEMS",
          "line": 3,
          "type": 0
        },
        "identifier": "<ITEMS>",
        "name": "state"
      },
      {
        "type": "variable",
        "token": {
          "column": 27,
          "lexeme": "STATES",
          "line": 3,
          "type": 0
        },
        "identifier": "<STATES>",
        "name": "rest"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "ITEMS",
      "line": 4,
      "type": 0
    },
    "identifier": "<ITEMS>",
    "originalProductionIndex": 3,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 10,
          "lexeme": "ITEM",
          "line": 4,
          "type": 0
        },
        "identifier": "<ITEM>",
        "name": "item"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "ITEMS",
      "line": 4,
      "type": 0
    },
    "identifier": "<ITEMS>",
    "originalProductionIndex": 3,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 10,
          "lexeme": "ITEM",
          "line": 4,
          "type": 0
        },
        "identifier": "<ITEM>",
        "name": "item"
      },
      {
        "type": "terminal",
        "token": {
          "column": 24,
          "lexeme": "COMMA",
          "line": 4,
          "type": 0
        },
        "identifier": "[COMMA]",
        "name": null
      },
      {
        "type": "variable",
        "token": {
          "column": 32,
          "lexeme": "ITEMS",
          "line": 4,
          "type": 0
        },
        "identifier": "<ITEMS>",
        "name": "rest"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "ITEM",
      "line": 5,
      "type": 0
    },
    "identifier": "<ITEM>",
    "originalProductionIndex": 4,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 9,
          "lexeme": "L_BRACKET",
          "line": 5,
          "type": 0
        },
        "identifier": "[L_BRACKET]",
        "name": null
      },
      {
        "type": "terminal",
        "token": {
          "column": 21,
          "lexeme": "IDENTIFIER",
          "line": 5,
          "type": 0
        },
        "identifier": "[IDENTIFIER]",
        "name": "name"
      },
      {
        "type": "terminal",
        "token": {
          "column": 40,
          "lexeme": "R_BRACKET",
          "line": 5,
          "type": 0
        },
        "identifier": "[R_BRACKET]",
        "name": null
      },
      {
        "type": "terminal",
        "token": {
          "column": 52,
          "lexeme": "EQUALS",
          "line": 5,
          "type": 0
        },
        "identifier": "[EQUALS]",
        "name": null
      },
      {
        "type": "terminal",
        "token": {
          "column": 61,
          "lexeme": "IDENTIFIER",
          "line": 5,
          "type": 0
        },
        "identifier": "[IDENTIFIER]",
        "name": "action"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "ITEM",
      "line": 6,
      "type": 0
    },
    "identifier": "<ITEM>",
    "originalProductionIndex": 5,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 9,
          "lexeme": "L_ANGLE",
          "line": 6,
          "type": 0
        },
        "identifier": "[L_ANGLE]",
        "name": null
      },
      {
        "type": "terminal",
        "token": {
          "column": 19,
          "lexeme": "IDENTIFIER",
          "line": 6,
          "type": 0
        },
        "identifier": "[IDENTIFIER]",
        "name": "name"
      },
      {
        "type": "terminal",
        "token": {
          "column": 38,
          "lexeme": "R_ANGLE",
          "line": 6,
          "type": 0
        },
        "identifier": "[R_ANGLE]",
        "name": null
      },
      {
        "type": "terminal",
        "token": {
          "column": 48,
          "lexeme": "EQUALS",
          "line": 6,
          "type": 0
        },
        "identifier": "[EQUALS]",
        "name": null
      },
      {
        "type": "terminal",
        "token": {
          "column": 57,
          "lexeme": "NUMBER",
          "line": 6,
          "type": 0
        },
        "identifier": "[NUMBER]",
        "name": "state"
      }
    ]
  }
];
    export const selfhosted = { states, productions };