export const states = [
  {
    "[EOF]": {
      "type": "shift",
      "value": 4
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 5
    },
    "<PROGRAM>": {
      "type": "goto",
      "value": 1
    },
    "<PRODUCTIONS>": {
      "type": "goto",
      "value": 2
    },
    "<PRODUCTION>": {
      "type": "goto",
      "value": 3
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
      "value": 6
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 3
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 5
    },
    "<PRODUCTIONS>": {
      "type": "goto",
      "value": 7
    },
    "<PRODUCTION>": {
      "type": "goto",
      "value": 3
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 1
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 8
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 2
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 4
    }
  },
  {
    "[R_ANGLE]": {
      "type": "shift",
      "value": 9
    }
  },
  {
    "[COLON]": {
      "type": "shift",
      "value": 10
    }
  },
  {
    "[L_PAREN]": {
      "type": "shift",
      "value": 15
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 16
    },
    "[L_BRACKET]": {
      "type": "shift",
      "value": 17
    },
    "<TOKENS>": {
      "type": "goto",
      "value": 11
    },
    "<TOKEN>": {
      "type": "goto",
      "value": 12
    },
    "<VARIABLE>": {
      "type": "goto",
      "value": 13
    },
    "<TERMINAL>": {
      "type": "goto",
      "value": 14
    }
  },
  {
    "[SEMICOLON]": {
      "type": "shift",
      "value": 18
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 6
    },
    "[L_PAREN]": {
      "type": "shift",
      "value": 15
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 16
    },
    "[L_BRACKET]": {
      "type": "shift",
      "value": 17
    },
    "<TOKENS>": {
      "type": "goto",
      "value": 19
    },
    "<TOKEN>": {
      "type": "goto",
      "value": 20
    },
    "<VARIABLE>": {
      "type": "goto",
      "value": 13
    },
    "<TERMINAL>": {
      "type": "goto",
      "value": 14
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 8
    },
    "[R_PAREN]": {
      "type": "reduce",
      "value": 8
    },
    "[L_PAREN]": {
      "type": "reduce",
      "value": 8
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 8
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 8
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 9
    },
    "[R_PAREN]": {
      "type": "reduce",
      "value": 9
    },
    "[L_PAREN]": {
      "type": "reduce",
      "value": 9
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 9
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 9
    }
  },
  {
    "[L_PAREN]": {
      "type": "shift",
      "value": 15
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 16
    },
    "[L_BRACKET]": {
      "type": "shift",
      "value": 17
    },
    "<TOKENS>": {
      "type": "goto",
      "value": 21
    },
    "<TOKEN>": {
      "type": "goto",
      "value": 22
    },
    "<VARIABLE>": {
      "type": "goto",
      "value": 13
    },
    "<TERMINAL>": {
      "type": "goto",
      "value": 14
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 24
    },
    "<INSIDE>": {
      "type": "goto",
      "value": 23
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 26
    },
    "<INSIDE>": {
      "type": "goto",
      "value": 25
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 5
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 5
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 7
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 6
    },
    "[R_PAREN]": {
      "type": "reduce",
      "value": 6
    },
    "[L_PAREN]": {
      "type": "shift",
      "value": 15
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 16
    },
    "[L_BRACKET]": {
      "type": "shift",
      "value": 17
    },
    "<TOKENS>": {
      "type": "goto",
      "value": 27
    },
    "<TOKEN>": {
      "type": "goto",
      "value": 20
    },
    "<VARIABLE>": {
      "type": "goto",
      "value": 13
    },
    "<TERMINAL>": {
      "type": "goto",
      "value": 14
    }
  },
  {
    "[R_PAREN]": {
      "type": "shift",
      "value": 28
    }
  },
  {
    "[R_PAREN]": {
      "type": "reduce",
      "value": 6
    },
    "[L_PAREN]": {
      "type": "shift",
      "value": 15
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 16
    },
    "[L_BRACKET]": {
      "type": "shift",
      "value": 17
    },
    "<TOKENS>": {
      "type": "goto",
      "value": 29
    },
    "<TOKEN>": {
      "type": "goto",
      "value": 20
    },
    "<VARIABLE>": {
      "type": "goto",
      "value": 13
    },
    "<TERMINAL>": {
      "type": "goto",
      "value": 14
    }
  },
  {
    "[R_ANGLE]": {
      "type": "shift",
      "value": 30
    },
    "[COLON]": {
      "type": "shift",
      "value": 31
    }
  },
  {
    "[R_ANGLE]": {
      "type": "reduce",
      "value": 15
    },
    "[COLON]": {
      "type": "reduce",
      "value": 15
    },
    "[PIPE]": {
      "type": "shift",
      "value": 32
    }
  },
  {
    "[R_BRACKET]": {
      "type": "shift",
      "value": 33
    },
    "[COLON]": {
      "type": "shift",
      "value": 34
    }
  },
  {
    "[R_BRACKET]": {
      "type": "reduce",
      "value": 15
    },
    "[COLON]": {
      "type": "reduce",
      "value": 15
    },
    "[PIPE]": {
      "type": "shift",
      "value": 35
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 7
    },
    "[R_PAREN]": {
      "type": "reduce",
      "value": 7
    }
  },
  {
    "[QUESTION_MARK]": {
      "type": "shift",
      "value": 36
    }
  },
  {
    "[R_PAREN]": {
      "type": "reduce",
      "value": 7
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 11
    },
    "[R_PAREN]": {
      "type": "reduce",
      "value": 11
    },
    "[L_PAREN]": {
      "type": "reduce",
      "value": 11
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 11
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 11
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 37
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 39
    },
    "<INSIDE>": {
      "type": "goto",
      "value": 38
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 13
    },
    "[R_PAREN]": {
      "type": "reduce",
      "value": 13
    },
    "[L_PAREN]": {
      "type": "reduce",
      "value": 13
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 13
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 13
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 40
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 39
    },
    "<INSIDE>": {
      "type": "goto",
      "value": 41
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 10
    },
    "[R_PAREN]": {
      "type": "reduce",
      "value": 10
    },
    "[L_PAREN]": {
      "type": "reduce",
      "value": 10
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 10
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 10
    }
  },
  {
    "[R_ANGLE]": {
      "type": "shift",
      "value": 42
    }
  },
  {
    "[R_ANGLE]": {
      "type": "reduce",
      "value": 16
    },
    "[COLON]": {
      "type": "reduce",
      "value": 16
    }
  },
  {
    "[R_ANGLE]": {
      "type": "reduce",
      "value": 15
    },
    "[COLON]": {
      "type": "reduce",
      "value": 15
    },
    "[R_BRACKET]": {
      "type": "reduce",
      "value": 15
    },
    "[PIPE]": {
      "type": "shift",
      "value": 43
    }
  },
  {
    "[R_BRACKET]": {
      "type": "shift",
      "value": 44
    }
  },
  {
    "[R_BRACKET]": {
      "type": "reduce",
      "value": 16
    },
    "[COLON]": {
      "type": "reduce",
      "value": 16
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 12
    },
    "[R_PAREN]": {
      "type": "reduce",
      "value": 12
    },
    "[L_PAREN]": {
      "type": "reduce",
      "value": 12
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 12
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 12
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 39
    },
    "<INSIDE>": {
      "type": "goto",
      "value": 45
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 14
    },
    "[R_PAREN]": {
      "type": "reduce",
      "value": 14
    },
    "[L_PAREN]": {
      "type": "reduce",
      "value": 14
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 14
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 14
    }
  },
  {
    "[R_ANGLE]": {
      "type": "reduce",
      "value": 16
    },
    "[COLON]": {
      "type": "reduce",
      "value": 16
    },
    "[R_BRACKET]": {
      "type": "reduce",
      "value": 16
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
        "type": "terminal",
        "token": {
          "column": 42,
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
          "column": 13,
          "lexeme": "PRODUCTIONS",
          "line": 2,
          "type": 0
        },
        "identifier": "<PRODUCTIONS>",
        "name": "productions"
      },
      {
        "type": "terminal",
        "token": {
          "column": 42,
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
      "lexeme": "PRODUCTIONS",
      "line": 3,
      "type": 0
    },
    "identifier": "<PRODUCTIONS>",
    "originalProductionIndex": 2,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 16,
          "lexeme": "PRODUCTION",
          "line": 3,
          "type": 0
        },
        "identifier": "<PRODUCTION>",
        "name": "production"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "PRODUCTIONS",
      "line": 3,
      "type": 0
    },
    "identifier": "<PRODUCTIONS>",
    "originalProductionIndex": 2,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 16,
          "lexeme": "PRODUCTION",
          "line": 3,
          "type": 0
        },
        "identifier": "<PRODUCTION>",
        "name": "production"
      },
      {
        "type": "variable",
        "token": {
          "column": 42,
          "lexeme": "PRODUCTIONS",
          "line": 3,
          "type": 0
        },
        "identifier": "<PRODUCTIONS>",
        "name": "rest"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "PRODUCTION",
      "line": 4,
      "type": 0
    },
    "identifier": "<PRODUCTION>",
    "originalProductionIndex": 3,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 15,
          "lexeme": "L_ANGLE",
          "line": 4,
          "type": 0
        },
        "identifier": "[L_ANGLE]",
        "name": null
      },
      {
        "type": "terminal",
        "token": {
          "column": 25,
          "lexeme": "IDENTIFIER",
          "line": 4,
          "type": 0
        },
        "identifier": "[IDENTIFIER]",
        "name": "production_name"
      },
      {
        "type": "terminal",
        "token": {
          "column": 55,
          "lexeme": "R_ANGLE",
          "line": 4,
          "type": 0
        },
        "identifier": "[R_ANGLE]",
        "name": null
      },
      {
        "type": "terminal",
        "token": {
          "column": 65,
          "lexeme": "COLON",
          "line": 4,
          "type": 0
        },
        "identifier": "[COLON]",
        "name": null
      },
      {
        "type": "variable",
        "token": {
          "column": 73,
          "lexeme": "TOKENS",
          "line": 4,
          "type": 0
        },
        "identifier": "<TOKENS>",
        "name": "tokens"
      },
      {
        "type": "terminal",
        "token": {
          "column": 90,
          "lexeme": "SEMICOLON",
          "line": 4,
          "type": 0
        },
        "identifier": "[SEMICOLON]",
        "name": null
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "TOKENS",
      "line": 5,
      "type": 0
    },
    "identifier": "<TOKENS>",
    "originalProductionIndex": 4,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 11,
          "lexeme": "TOKEN",
          "line": 5,
          "type": 0
        },
        "identifier": "<TOKEN>",
        "name": "token"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "TOKENS",
      "line": 5,
      "type": 0
    },
    "identifier": "<TOKENS>",
    "originalProductionIndex": 4,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 11,
          "lexeme": "TOKEN",
          "line": 5,
          "type": 0
        },
        "identifier": "<TOKEN>",
        "name": "token"
      },
      {
        "type": "variable",
        "token": {
          "column": 27,
          "lexeme": "TOKENS",
          "line": 5,
          "type": 0
        },
        "identifier": "<TOKENS>",
        "name": "rest"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "TOKEN",
      "line": 6,
      "type": 0
    },
    "identifier": "<TOKEN>",
    "originalProductionIndex": 5,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 10,
          "lexeme": "VARIABLE",
          "line": 6,
          "type": 0
        },
        "identifier": "<VARIABLE>",
        "name": "token"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "TOKEN",
      "line": 6,
      "type": 0
    },
    "identifier": "<TOKEN>",
    "originalProductionIndex": 5,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 21,
          "lexeme": "TERMINAL",
          "line": 6,
          "type": 0
        },
        "identifier": "<TERMINAL>",
        "name": "token"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "TOKEN",
      "line": 7,
      "type": 0
    },
    "identifier": "<TOKEN>",
    "originalProductionIndex": 6,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 10,
          "lexeme": "L_PAREN",
          "line": 7,
          "type": 0
        },
        "identifier": "[L_PAREN]",
        "name": null
      },
      {
        "type": "variable",
        "token": {
          "column": 20,
          "lexeme": "TOKENS",
          "line": 7,
          "type": 0
        },
        "identifier": "<TOKENS>",
        "name": "tokens"
      },
      {
        "type": "terminal",
        "token": {
          "column": 37,
          "lexeme": "R_PAREN",
          "line": 7,
          "type": 0
        },
        "identifier": "[R_PAREN]",
        "name": null
      },
      {
        "type": "terminal",
        "token": {
          "column": 47,
          "lexeme": "QUESTION_MARK",
          "line": 7,
          "type": 0
        },
        "identifier": "[QUESTION_MARK]",
        "name": "question_mark"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "VARIABLE",
      "line": 8,
      "type": 0
    },
    "identifier": "<VARIABLE>",
    "originalProductionIndex": 7,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 13,
          "lexeme": "L_ANGLE",
          "line": 8,
          "type": 0
        },
        "identifier": "[L_ANGLE]",
        "name": null
      },
      {
        "type": "variable",
        "token": {
          "column": 23,
          "lexeme": "INSIDE",
          "line": 8,
          "type": 0
        },
        "identifier": "<INSIDE>",
        "name": "inside"
      },
      {
        "type": "terminal",
        "token": {
          "column": 76,
          "lexeme": "R_ANGLE",
          "line": 8,
          "type": 0
        },
        "identifier": "[R_ANGLE]",
        "name": null
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "VARIABLE",
      "line": 8,
      "type": 0
    },
    "identifier": "<VARIABLE>",
    "originalProductionIndex": 7,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 13,
          "lexeme": "L_ANGLE",
          "line": 8,
          "type": 0
        },
        "identifier": "[L_ANGLE]",
        "name": null
      },
      {
        "type": "variable",
        "token": {
          "column": 23,
          "lexeme": "INSIDE",
          "line": 8,
          "type": 0
        },
        "identifier": "<INSIDE>",
        "name": "inside"
      },
      {
        "type": "terminal",
        "token": {
          "column": 41,
          "lexeme": "COLON",
          "line": 8,
          "type": 0
        },
        "identifier": "[COLON]",
        "name": null
      },
      {
        "type": "terminal",
        "token": {
          "column": 49,
          "lexeme": "IDENTIFIER",
          "line": 8,
          "type": 0
        },
        "identifier": "[IDENTIFIER]",
        "name": "token_name"
      },
      {
        "type": "terminal",
        "token": {
          "column": 76,
          "lexeme": "R_ANGLE",
          "line": 8,
          "type": 0
        },
        "identifier": "[R_ANGLE]",
        "name": null
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "TERMINAL",
      "line": 9,
      "type": 0
    },
    "identifier": "<TERMINAL>",
    "originalProductionIndex": 8,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 13,
          "lexeme": "L_BRACKET",
          "line": 9,
          "type": 0
        },
        "identifier": "[L_BRACKET]",
        "name": null
      },
      {
        "type": "variable",
        "token": {
          "column": 25,
          "lexeme": "INSIDE",
          "line": 9,
          "type": 0
        },
        "identifier": "<INSIDE>",
        "name": "inside"
      },
      {
        "type": "terminal",
        "token": {
          "column": 78,
          "lexeme": "R_BRACKET",
          "line": 9,
          "type": 0
        },
        "identifier": "[R_BRACKET]",
        "name": null
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "TERMINAL",
      "line": 9,
      "type": 0
    },
    "identifier": "<TERMINAL>",
    "originalProductionIndex": 8,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 13,
          "lexeme": "L_BRACKET",
          "line": 9,
          "type": 0
        },
        "identifier": "[L_BRACKET]",
        "name": null
      },
      {
        "type": "variable",
        "token": {
          "column": 25,
          "lexeme": "INSIDE",
          "line": 9,
          "type": 0
        },
        "identifier": "<INSIDE>",
        "name": "inside"
      },
      {
        "type": "terminal",
        "token": {
          "column": 43,
          "lexeme": "COLON",
          "line": 9,
          "type": 0
        },
        "identifier": "[COLON]",
        "name": null
      },
      {
        "type": "terminal",
        "token": {
          "column": 51,
          "lexeme": "IDENTIFIER",
          "line": 9,
          "type": 0
        },
        "identifier": "[IDENTIFIER]",
        "name": "token_name"
      },
      {
        "type": "terminal",
        "token": {
          "column": 78,
          "lexeme": "R_BRACKET",
          "line": 9,
          "type": 0
        },
        "identifier": "[R_BRACKET]",
        "name": null
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "INSIDE",
      "line": 10,
      "type": 0
    },
    "identifier": "<INSIDE>",
    "originalProductionIndex": 9,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 11,
          "lexeme": "IDENTIFIER",
          "line": 10,
          "type": 0
        },
        "identifier": "[IDENTIFIER]",
        "name": "identifier"
      }
    ]
  },
  {
    "lhs": {
      "column": 1,
      "lexeme": "INSIDE",
      "line": 10,
      "type": 0
    },
    "identifier": "<INSIDE>",
    "originalProductionIndex": 9,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 11,
          "lexeme": "IDENTIFIER",
          "line": 10,
          "type": 0
        },
        "identifier": "[IDENTIFIER]",
        "name": "identifier"
      },
      {
        "type": "terminal",
        "token": {
          "column": 37,
          "lexeme": "PIPE",
          "line": 10,
          "type": 0
        },
        "identifier": "[PIPE]",
        "name": null
      },
      {
        "type": "variable",
        "token": {
          "column": 44,
          "lexeme": "INSIDE",
          "line": 10,
          "type": 0
        },
        "identifier": "<INSIDE>",
        "name": "rest"
      }
    ]
  }
];
    export const selfhosted = { states, productions };