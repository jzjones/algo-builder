import { ERRORS } from "@algo-builder/web";
import { assert } from "chai";
import chalk from "chalk";
import * as fsExtra from "fs-extra";
import * as os from "os";
import * as path from "path";

import * as types from "../../../../src/internal/core/params/argument-types";
import { expectBuilderError } from "../../../helpers/errors";

describe("argumentTypes", () => {
  it("should set the right name to all the argument types", () => {
    for (const typeName of Object.keys(types)) {
      const argumentTypesMap: {
        [name: string]: types.ArgumentType<any>
      } = types;
      assert.equal(argumentTypesMap[typeName].name, typeName);
    }
  });

  describe("string type", () => {
    it("should work with valid values", () => {
      assert.equal(types.string.parse("arg", "asd"), "asd");
      assert.equal(types.string.parse("arg", "asd1"), "asd1");
      assert.equal(types.string.parse("arg", "asd 123"), "asd 123");
      assert.equal(types.string.parse("arg", "1"), "1");
      assert.equal(types.string.parse("arg", ""), "");
    });
  });

  describe("boolean type", () => {
    it("should work with valid values", () => {
      assert.equal(types.boolean.parse("arg", "true"), true);
      assert.equal(types.boolean.parse("arg", "false"), false);
    });

    it("should throw the right error on invalid values", () => {
      expectBuilderError(
        () => types.boolean.parse("arg", "asd1"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.boolean.parse("arg", "f"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.boolean.parse("arg", "t"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.boolean.parse("arg", "1"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.boolean.parse("arg", "0"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.boolean.parse("arg", ""),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
    });
  });

  describe("int type", () => {
    it("should work with decimal values", () => {
      assert.equal(types.int.parse("arg", "0"), 0);
      assert.equal(types.int.parse("arg", "1"), 1);
      assert.equal(types.int.parse("arg", "1123"), 1123);
      assert.equal(types.int.parse("arg", "05678"), 5678);
    });

    it("should work with hex values", () => {
      assert.equal(types.int.parse("arg", "0x0"), 0);
      assert.equal(types.int.parse("arg", "0x1"), 1);
      assert.equal(types.int.parse("arg", "0xA"), 0xa);
      assert.equal(types.int.parse("arg", "0xa"), 0xa);
      assert.equal(types.int.parse("arg", "0x0a"), 0x0a);
    });

    it("should work with decimal scientific notation", () => {
      assert.equal(types.int.parse("arg", "1e0"), 1);
      assert.equal(types.int.parse("arg", "1e123"), 1e123);
      assert.equal(types.int.parse("arg", "12e0"), 12);
      assert.equal(types.int.parse("arg", "012e1"), 120);
      assert.equal(types.int.parse("arg", "0e12"), 0);
    });

    it("should fail with incorrect values", () => {
      expectBuilderError(
        () => types.int.parse("arg", ""),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.int.parse("arg", "1."),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.int.parse("arg", ".1"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.int.parse("arg", "0.1"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.int.parse("arg", "asdas"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.int.parse("arg", "a1"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.int.parse("arg", "1a"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.int.parse("arg", "1 1"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.int.parse("arg", "x123"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
    });
  });

  describe("float type", () => {
    it("should work with integer decimal values", () => {
      assert.equal(types.float.parse("arg", "0"), 0);
      assert.equal(types.float.parse("arg", "1"), 1);
      assert.equal(types.float.parse("arg", "1123"), 1123);
      assert.equal(types.float.parse("arg", "05678"), 5678);
    });

    it("should work with non-integer decimal values", () => {
      assert.equal(types.float.parse("arg", "0.1"), 0.1);
      assert.equal(types.float.parse("arg", "123.123"), 123.123);
      assert.equal(types.float.parse("arg", ".123"), 0.123);
      assert.equal(types.float.parse("arg", "0."), 0);
    });

    it("should work with integer hex values", () => {
      assert.equal(types.float.parse("arg", "0x0"), 0);
      assert.equal(types.float.parse("arg", "0x1"), 1);
      assert.equal(types.float.parse("arg", "0xA"), 0xa);
      assert.equal(types.float.parse("arg", "0xa"), 0xa);
      assert.equal(types.float.parse("arg", "0x0a"), 0x0a);
    });

    it("should work with decimal scientific notation", () => {
      assert.equal(types.float.parse("arg", "1e0"), 1);
      assert.equal(types.float.parse("arg", "1e123"), 1e123);
      assert.equal(types.float.parse("arg", "12e0"), 12);
      assert.equal(types.float.parse("arg", "012e1"), 120);
      assert.equal(types.float.parse("arg", "0e12"), 0);
      assert.equal(types.float.parse("arg", "1.e123"), 1e123);
      assert.equal(types.float.parse("arg", "1.0e123"), 1e123);
      assert.equal(types.float.parse("arg", "1.0123e123"), 1.0123e123);
    });

    it("should fail with incorrect values", () => {
      expectBuilderError(
        () => types.float.parse("arg", ""),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.float.parse("arg", "."),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.float.parse("arg", ".."),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.float.parse("arg", "1..1"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.float.parse("arg", "1.asd"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.float.parse("arg", "asd.123"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.float.parse("arg", "asdas"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.float.parse("arg", "a1"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.float.parse("arg", "1a"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.float.parse("arg", "1 1"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
      expectBuilderError(
        () => types.float.parse("arg", "x123"),
        ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
      );
    });
  });

  describe("Input file type", () => {
    it("Should return the file path if the file exists and is readable", () => {
      const output = types.inputFile.parse("A file", __filename);
      assert.equal(output, __filename);
    });

    it("Should work with a relative path", () => {
      const relative = path.relative(process.cwd(), __filename);
      const output = types.inputFile.parse("A file", relative);
      assert.equal(output, relative);
    });

    it("Should work with an absolute path", async () => {
      const absolute = await fsExtra.realpath(__filename);
      const output = types.inputFile.parse("A file", absolute);
      assert.equal(output, absolute);
    });

    it("Should throw if the file doesnt exist", () => {
      expectBuilderError(
        () => types.inputFile.parse("A file", "NON_EXISTENT_FILE"),
        ERRORS.ARGUMENTS.INVALID_INPUT_FILE
      );
    });

    it("Should throw if the file isn't readable", function () {
      const isRoot = process.getuid && process.getuid() === 0;
      if (os.type() === "Windows_NT" || isRoot) {
        console.warn(chalk.yellowBright("Skipping test: either OS is windows or tests are being run as root"));
        this.skip();
      }

      fsExtra.createFileSync("A");
      fsExtra.chmodSync("A", 0o000); // assign no permission [read-execute-write: 000]

      // check if permission set or not, if we are NOT able to access the file,
      // then 000 permission was successfully set, otherwise skip the test
      // (if system is reading it anyway)
      fsExtra.access("A", fsExtra.constants.R_OK, (err) => {
        if (err) {
          console.warn(chalk.yellowBright("Skipping test: permission not set successfully"));
          this.skip();
        }
      });

      expectBuilderError(
        () => types.inputFile.parse("A file", "A"),
        ERRORS.ARGUMENTS.INVALID_INPUT_FILE
      );

      fsExtra.unlinkSync("A");
    });

    it("Should throw if a directory is given", () => {
      expectBuilderError(
        () => types.inputFile.parse("A file", __dirname),
        ERRORS.ARGUMENTS.INVALID_INPUT_FILE
      );
    });
  });

  describe("JSON type", () => {
    it("Should fail if the argument isn't JSON", () => {
      expectBuilderError(
        () => types.json.parse("j", "a"),
        ERRORS.ARGUMENTS.INVALID_JSON_ARGUMENT
      );

      expectBuilderError(
        () => types.json.parse("j", "{a:1"),
        ERRORS.ARGUMENTS.INVALID_JSON_ARGUMENT
      );

      expectBuilderError(
        () => types.json.parse("j", "[1],"),
        ERRORS.ARGUMENTS.INVALID_JSON_ARGUMENT
      );
    });

    it("Should parse an object successfully", () => {
      assert.deepEqual(types.json.parse("j", '{"a":1}'), { a: 1 });
    });

    it("Should parse a number", () => {
      assert.deepEqual(types.json.parse("j", "123"), 123);
    });

    it("Should parse a list", () => {
      assert.deepEqual(types.json.parse("j", "[1,2]"), [1, 2]);
    });

    it("Should parse a string", () => {
      assert.deepEqual(types.json.parse("j", '"a"'), "a");
    });

    it("Should accept anything except undefined as valid", () => {
      const validate = types.json.validate;
      if (validate === undefined) {
        assert.fail("types.json.validate must exist");
        return;
      }
      assert.doesNotThrow(() => validate("json", 1));
      assert.doesNotThrow(() => validate("json", "asd"));
      assert.doesNotThrow(() => validate("json", [1]));
      assert.doesNotThrow(() => validate("json", { a: 123 }));
      assert.doesNotThrow(() => validate("json", null));

      assert.throws(() => validate("json", undefined));
    });
  });
});
