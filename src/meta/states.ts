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
    },
    "[COLON]": {
      "type": "shift",
      "value": 10
    }
  },
  {
    "[COLON]": {
      "type": "shift",
      "value": 11
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 12
    }
  },
  {
    "[L_PAREN]": {
      "type": "shift",
      "value": 17
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 18
    },
    "[L_BRACKET]": {
      "type": "shift",
      "value": 19
    },
    "<TOKENS>": {
      "type": "goto",
      "value": 13
    },
    "<TOKEN>": {
      "type": "goto",
      "value": 14
    },
    "<VARIABLE>": {
      "type": "goto",
      "value": 15
    },
    "<TERMINAL>": {
      "type": "goto",
      "value": 16
    }
  },
  {
    "[R_ANGLE]": {
      "type": "shift",
      "value": 20
    }
  },
  {
    "[SEMICOLON]": {
      "type": "shift",
      "value": 21
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 7
    },
    "[L_PAREN]": {
      "type": "shift",
      "value": 17
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 18
    },
    "[L_BRACKET]": {
      "type": "shift",
      "value": 19
    },
    "<TOKENS>": {
      "type": "goto",
      "value": 22
    },
    "<TOKEN>": {
      "type": "goto",
      "value": 23
    },
    "<VARIABLE>": {
      "type": "goto",
      "value": 15
    },
    "<TERMINAL>": {
      "type": "goto",
      "value": 16
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
    "[L_PAREN]": {
      "type": "shift",
      "value": 17
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 18
    },
    "[L_BRACKET]": {
      "type": "shift",
      "value": 19
    },
    "<TOKENS>": {
      "type": "goto",
      "value": 24
    },
    "<TOKEN>": {
      "type": "goto",
      "value": 25
    },
    "<VARIABLE>": {
      "type": "goto",
      "value": 15
    },
    "<TERMINAL>": {
      "type": "goto",
      "value": 16
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 27
    },
    "<INSIDE>": {
      "type": "goto",
      "value": 26
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 29
    },
    "<INSIDE>": {
      "type": "goto",
      "value": 28
    }
  },
  {
    "[COLON]": {
      "type": "shift",
      "value": 30
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
      "value": 8
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
    },
    "[L_PAREN]": {
      "type": "shift",
      "value": 17
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 18
    },
    "[L_BRACKET]": {
      "type": "shift",
      "value": 19
    },
    "<TOKENS>": {
      "type": "goto",
      "value": 31
    },
    "<TOKEN>": {
      "type": "goto",
      "value": 23
    },
    "<VARIABLE>": {
      "type": "goto",
      "value": 15
    },
    "<TERMINAL>": {
      "type": "goto",
      "value": 16
    }
  },
  {
    "[R_PAREN]": {
      "type": "shift",
      "value": 32
    }
  },
  {
    "[R_PAREN]": {
      "type": "reduce",
      "value": 7
    },
    "[L_PAREN]": {
      "type": "shift",
      "value": 17
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 18
    },
    "[L_BRACKET]": {
      "type": "shift",
      "value": 19
    },
    "<TOKENS>": {
      "type": "goto",
      "value": 33
    },
    "<TOKEN>": {
      "type": "goto",
      "value": 23
    },
    "<VARIABLE>": {
      "type": "goto",
      "value": 15
    },
    "<TERMINAL>": {
      "type": "goto",
      "value": 16
    }
  },
  {
    "[R_ANGLE]": {
      "type": "shift",
      "value": 34
    },
    "[COLON]": {
      "type": "shift",
      "value": 35
    }
  },
  {
    "[R_ANGLE]": {
      "type": "reduce",
      "value": 18
    },
    "[COLON]": {
      "type": "reduce",
      "value": 18
    },
    "[PIPE]": {
      "type": "shift",
      "value": 36
    }
  },
  {
    "[R_BRACKET]": {
      "type": "shift",
      "value": 37
    },
    "[COLON]": {
      "type": "shift",
      "value": 38
    }
  },
  {
    "[R_BRACKET]": {
      "type": "reduce",
      "value": 18
    },
    "[COLON]": {
      "type": "reduce",
      "value": 18
    },
    "[PIPE]": {
      "type": "shift",
      "value": 39
    }
  },
  {
    "[L_PAREN]": {
      "type": "shift",
      "value": 17
    },
    "[L_ANGLE]": {
      "type": "shift",
      "value": 18
    },
    "[L_BRACKET]": {
      "type": "shift",
      "value": 19
    },
    "<TOKENS>": {
      "type": "goto",
      "value": 40
    },
    "<TOKEN>": {
      "type": "goto",
      "value": 14
    },
    "<VARIABLE>": {
      "type": "goto",
      "value": 15
    },
    "<TERMINAL>": {
      "type": "goto",
      "value": 16
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
    }
  },
  {
    "[QUESTION_MARK]": {
      "type": "shift",
      "value": 41
    },
    "[PLUS]": {
      "type": "shift",
      "value": 42
    },
    "[STAR]": {
      "type": "shift",
      "value": 43
    }
  },
  {
    "[R_PAREN]": {
      "type": "reduce",
      "value": 8
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
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 44
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 46
    },
    "<INSIDE>": {
      "type": "goto",
      "value": 45
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 16
    },
    "[R_PAREN]": {
      "type": "reduce",
      "value": 16
    },
    "[L_PAREN]": {
      "type": "reduce",
      "value": 16
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 16
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 16
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 47
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 46
    },
    "<INSIDE>": {
      "type": "goto",
      "value": 48
    }
  },
  {
    "[SEMICOLON]": {
      "type": "shift",
      "value": 49
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
    "[R_ANGLE]": {
      "type": "shift",
      "value": 50
    }
  },
  {
    "[R_ANGLE]": {
      "type": "reduce",
      "value": 19
    },
    "[COLON]": {
      "type": "reduce",
      "value": 19
    }
  },
  {
    "[R_ANGLE]": {
      "type": "reduce",
      "value": 18
    },
    "[COLON]": {
      "type": "reduce",
      "value": 18
    },
    "[R_BRACKET]": {
      "type": "reduce",
      "value": 18
    },
    "[PIPE]": {
      "type": "shift",
      "value": 51
    }
  },
  {
    "[R_BRACKET]": {
      "type": "shift",
      "value": 52
    }
  },
  {
    "[R_BRACKET]": {
      "type": "reduce",
      "value": 19
    },
    "[COLON]": {
      "type": "reduce",
      "value": 19
    }
  },
  {
    "[EOF]": {
      "type": "reduce",
      "value": 6
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 6
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 15
    },
    "[R_PAREN]": {
      "type": "reduce",
      "value": 15
    },
    "[L_PAREN]": {
      "type": "reduce",
      "value": 15
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 15
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 15
    }
  },
  {
    "[IDENTIFIER]": {
      "type": "shift",
      "value": 46
    },
    "<INSIDE>": {
      "type": "goto",
      "value": 53
    }
  },
  {
    "[SEMICOLON]": {
      "type": "reduce",
      "value": 17
    },
    "[R_PAREN]": {
      "type": "reduce",
      "value": 17
    },
    "[L_PAREN]": {
      "type": "reduce",
      "value": 17
    },
    "[L_ANGLE]": {
      "type": "reduce",
      "value": 17
    },
    "[L_BRACKET]": {
      "type": "reduce",
      "value": 17
    }
  },
  {
    "[R_ANGLE]": {
      "type": "reduce",
      "value": 19
    },
    "[COLON]": {
      "type": "reduce",
      "value": 19
    },
    "[R_BRACKET]": {
      "type": "reduce",
      "value": 19
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
    "name": null,
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
    "name": "program",
    "originalProductionIndex": 1,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 51,
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
    "name": "program",
    "originalProductionIndex": 1,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 22,
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
          "column": 51,
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
    "name": "productions",
    "originalProductionIndex": 2,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 29,
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
    "name": "productions",
    "originalProductionIndex": 2,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 29,
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
          "column": 55,
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
    "name": "production",
    "originalProductionIndex": 3,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 27,
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
          "column": 37,
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
          "column": 97,
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
          "column": 107,
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
          "column": 115,
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
          "column": 132,
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
      "lexeme": "PRODUCTION",
      "line": 4,
      "type": 0
    },
    "identifier": "<PRODUCTION>",
    "name": "production",
    "originalProductionIndex": 3,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 27,
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
          "column": 37,
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
          "column": 68,
          "lexeme": "COLON",
          "line": 4,
          "type": 0
        },
        "identifier": "[COLON]",
        "name": null
      },
      {
        "type": "terminal",
        "token": {
          "column": 76,
          "lexeme": "IDENTIFIER",
          "line": 4,
          "type": 0
        },
        "identifier": "[IDENTIFIER]",
        "name": "uuid"
      },
      {
        "type": "terminal",
        "token": {
          "column": 97,
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
          "column": 107,
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
          "column": 115,
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
          "column": 132,
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
    "name": "tokens",
    "originalProductionIndex": 4,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 19,
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
    "name": "tokens",
    "originalProductionIndex": 4,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 19,
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
          "column": 35,
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
    "name": "token",
    "originalProductionIndex": 5,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 17,
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
    "name": "token",
    "originalProductionIndex": 5,
    "rhs": [
      {
        "type": "variable",
        "token": {
          "column": 28,
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
    "name": "grouped_token",
    "originalProductionIndex": 6,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 25,
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
          "column": 35,
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
          "column": 52,
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
          "column": 62,
          "lexeme": "QUESTION_MARK",
          "line": 7,
          "type": 0
        },
        "identifier": "[QUESTION_MARK]",
        "name": "modifier"
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
    "name": "grouped_token",
    "originalProductionIndex": 6,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 25,
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
          "column": 35,
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
          "column": 52,
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
          "column": 78,
          "lexeme": "PLUS",
          "line": 7,
          "type": 0
        },
        "identifier": "[PLUS]",
        "name": "modifier"
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
    "name": "grouped_token",
    "originalProductionIndex": 6,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 25,
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
          "column": 35,
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
          "column": 52,
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
          "column": 85,
          "lexeme": "STAR",
          "line": 7,
          "type": 0
        },
        "identifier": "[STAR]",
        "name": "modifier"
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
    "name": "variable",
    "originalProductionIndex": 7,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 23,
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
          "column": 33,
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
          "column": 86,
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
    "name": "variable",
    "originalProductionIndex": 7,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 23,
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
          "column": 33,
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
          "column": 51,
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
          "column": 59,
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
          "column": 86,
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
    "name": "terminal",
    "originalProductionIndex": 8,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 23,
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
          "column": 35,
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
          "column": 88,
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
    "name": "terminal",
    "originalProductionIndex": 8,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 23,
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
          "column": 35,
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
          "column": 53,
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
          "column": 61,
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
          "column": 88,
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
    "name": "inside",
    "originalProductionIndex": 9,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 19,
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
    "name": "inside",
    "originalProductionIndex": 9,
    "rhs": [
      {
        "type": "terminal",
        "token": {
          "column": 19,
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
          "column": 45,
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
          "column": 52,
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