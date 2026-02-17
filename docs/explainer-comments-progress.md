# Explainer comments – master list

One-line algorithm/step comments across `src/**/*.ts`. Excludes `*.d.ts` and barrel `index.ts` files.

**Done** = file has been updated with explainer comments in this pass.  
**Todo** = not yet updated.

When all Todo items are either done or explicitly skipped (e.g. trivial/config), the task is complete.

---

## Progress summary

- **Done:** 46
- **Todo:** 117
- **Total content files:** 163

---

## App (`src/app/`)

- [x] app/code-editor/code-editor.component.ts
- [x] app/console/console.component.ts
- [x] app/console/console.service.ts
- [x] app/disk/disk.service.ts
- [x] app/disk/disk.component.ts
- [x] app/disk/filesystem-node.ts
- [ ] app/interpreter/audio.service.ts
- [ ] app/interpreter/graphics.service.ts
- [x] app/interpreter/interpreter.service.ts
- [x] app/interpreter/parser.service.ts
- [x] app/output/output.component.ts
- [ ] app/tab-switch.service.ts
- [ ] app/text-editor/text-editor.component.ts
- [ ] app/app.component.ts
- [ ] app/app.config.ts

---

## Lang core (`src/lang/`)

- [ ] lang/audio.ts
- [ ] lang/canonical-line.ts
- [ ] lang/colors.ts
- [ ] lang/control-flow-frame-stack.ts
- [ ] lang/control-flow-frames.ts
- [ ] lang/edu-basic-value.ts
- [ ] lang/execution-context.ts
- [x] lang/graphics.ts
- [x] lang/program-syntax-analysis.ts
- [x] lang/program.ts
- [x] lang/runtime-execution.ts
- [ ] lang/runtime-node.ts
- [ ] lang/collections.ts
- [ ] main.ts

---

## Lang parsing (`src/lang/parsing/`)

- [ ] lang/parsing/expression-parser.ts
- [ ] lang/parsing/keywords.ts
- [ ] lang/parsing/parse-result.ts
- [ ] lang/parsing/statement-dispatch.ts
- [ ] lang/parsing/tokenizer.ts
- [x] lang/parsing/helpers/expression-helpers.ts
- [ ] lang/parsing/helpers/token-helpers.ts
- [ ] lang/parsing/parsers/array-parsers.ts
- [ ] lang/parsing/parsers/audio-parsers.ts
- [ ] lang/parsing/parsers/control-flow-parsers.ts
- [ ] lang/parsing/parsers/file-io-parsers.ts
- [ ] lang/parsing/parsers/graphics-parsers.ts
- [ ] lang/parsing/parsers/io-parsers.ts
- [x] lang/parsing/parsers/misc-parsers.ts
- [ ] lang/parsing/parsers/parser-context.ts
- [x] lang/parsing/parsers/variable-parsers.ts

---

## Lang statements (`src/lang/statements/`)

- [ ] lang/statements/statement.ts
- [ ] lang/statements/unparsable-statement.ts

### Array

- [x] lang/statements/array/pop-statement.ts
- [x] lang/statements/array/push-statement.ts
- [x] lang/statements/array/shift-statement.ts
- [ ] lang/statements/array/unshift-statement.ts

### Audio

- [ ] lang/statements/audio/play-statement.ts
- [ ] lang/statements/audio/tempo-statement.ts
- [ ] lang/statements/audio/voice-statement.ts
- [ ] lang/statements/audio/volume-statement.ts

### Control flow

- [x] lang/statements/control-flow/call-statement.ts
- [ ] lang/statements/control-flow/catch-statement.ts
- [x] lang/statements/control-flow/case-statement.ts
- [ ] lang/statements/control-flow/continue-statement.ts
- [x] lang/statements/control-flow/do-loop-statement.ts
- [ ] lang/statements/control-flow/else-statement.ts
- [ ] lang/statements/control-flow/elseif-statement.ts
- [ ] lang/statements/control-flow/end-statement.ts
- [ ] lang/statements/control-flow/exit-statement.ts
- [ ] lang/statements/control-flow/finally-statement.ts
- [x] lang/statements/control-flow/for-statement.ts
- [x] lang/statements/control-flow/gosub-statement.ts
- [x] lang/statements/control-flow/goto-statement.ts
- [ ] lang/statements/control-flow/if-statement.ts
- [ ] lang/statements/control-flow/label-statement.ts
- [x] lang/statements/control-flow/loop-statement.ts
- [x] lang/statements/control-flow/next-statement.ts
- [ ] lang/statements/control-flow/return-statement.ts
- [ ] lang/statements/control-flow/select-case-statement.ts
- [ ] lang/statements/control-flow/sub-statement.ts
- [ ] lang/statements/control-flow/throw-statement.ts
- [x] lang/statements/control-flow/try-statement.ts
- [ ] lang/statements/control-flow/uend-statement.ts
- [ ] lang/statements/control-flow/unless-statement.ts
- [ ] lang/statements/control-flow/until-statement.ts
- [ ] lang/statements/control-flow/wend-statement.ts
- [ ] lang/statements/control-flow/while-statement.ts

### File I/O

- [ ] lang/statements/file-io/close-statement.ts
- [ ] lang/statements/file-io/copy-statement.ts
- [ ] lang/statements/file-io/delete-statement.ts
- [ ] lang/statements/file-io/line-input-statement.ts
- [ ] lang/statements/file-io/listdir-statement.ts
- [ ] lang/statements/file-io/mkdir-statement.ts
- [ ] lang/statements/file-io/move-statement.ts
- [x] lang/statements/file-io/open-statement.ts
- [ ] lang/statements/file-io/readfile-statement.ts
- [x] lang/statements/file-io/read-file-statement.ts
- [ ] lang/statements/file-io/rmdir-statement.ts
- [x] lang/statements/file-io/seek-statement.ts
- [ ] lang/statements/file-io/writefile-statement.ts
- [x] lang/statements/file-io/write-file-statement.ts

### Graphics

- [ ] lang/statements/graphics/arc-statement.ts
- [x] lang/statements/graphics/circle-statement.ts
- [ ] lang/statements/graphics/color-utils.ts
- [ ] lang/statements/graphics/get-statement.ts
- [x] lang/statements/graphics/line-statement.ts
- [ ] lang/statements/graphics/oval-statement.ts
- [x] lang/statements/graphics/paint-statement.ts
- [x] lang/statements/graphics/pset-statement.ts
- [ ] lang/statements/graphics/put-statement.ts
- [x] lang/statements/graphics/rectangle-statement.ts
- [x] lang/statements/graphics/triangle-statement.ts
- [ ] lang/statements/graphics/turtle-statement.ts

### I/O

- [ ] lang/statements/io/cls-statement.ts
- [ ] lang/statements/io/color-statement.ts
- [x] lang/statements/io/input-statement.ts
- [ ] lang/statements/io/locate-statement.ts
- [x] lang/statements/io/print-statement.ts

### Misc

- [ ] lang/statements/misc/command-help-registry.ts
- [ ] lang/statements/misc/console-statement.ts
- [ ] lang/statements/misc/help-statement.ts
- [x] lang/statements/misc/randomize-statement.ts
- [ ] lang/statements/misc/set-statement.ts
- [ ] lang/statements/misc/sleep-statement.ts
- [ ] lang/statements/misc/statement-help-registry.ts

### Variables

- [x] lang/statements/variables/dim-statement.ts
- [x] lang/statements/variables/let-bracket-statement.ts
- [x] lang/statements/variables/let-statement.ts
- [ ] lang/statements/variables/local-statement.ts

---

## Lang expressions (`src/lang/expressions/`)

- [ ] lang/expressions/binary-expression.ts
- [ ] lang/expressions/constant-expression.ts
- [ ] lang/expressions/expression.ts
- [ ] lang/expressions/literal-expression.ts
- [ ] lang/expressions/nullary-expression.ts
- [ ] lang/expressions/unary-expression.ts
- [x] lang/expressions/special/bracket-access-expression.ts
- [ ] lang/expressions/special/structure-member-expression.ts
- [ ] lang/expressions/special/structure-literal-expression.ts
- [ ] lang/expressions/special/variable-expression.ts
- [ ] lang/expressions/special/parenthesized-expression.ts
- [x] lang/expressions/special/multi-index-bracket-access-expression.ts
- [ ] lang/expressions/special/factorial-expression.ts
- [ ] lang/expressions/special/array-access-expression.ts
- [ ] lang/expressions/special/array-literal-expression.ts
- [ ] lang/expressions/special/array-slice-expression.ts
- [ ] lang/expressions/operators/angle-conversion-expression.ts
- [ ] lang/expressions/operators/array-search-expression.ts
- [ ] lang/expressions/operators/bars-expression.ts
- [ ] lang/expressions/operators/string-operator-expressions.ts
- [ ] lang/expressions/helpers/constant-evaluator.ts
- [ ] lang/expressions/helpers/mathematical-function-evaluator.ts
- [ ] lang/expressions/helpers/complex-function-evaluator.ts
- [ ] lang/expressions/helpers/string-function-evaluator.ts
- [ ] lang/expressions/helpers/type-conversion-evaluator.ts

---

## Excluded (not in list)

- `src/webaudio-tinysynth.d.ts` (declaration file)
- All `**/index.ts` barrel files
