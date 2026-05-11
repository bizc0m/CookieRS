import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  expandHomePath,
  normalizeExternalUrl,
  normalizePermissionValue,
  safeDownloadFilename
} from "../src/shared/validation.js";

test("normalizeExternalUrl accepts browser share targets", () => {
  assert.equal(normalizeExternalUrl("https://example.com/path"), "https://example.com/path");
  assert.equal(normalizeExternalUrl("http://example.com/"), "http://example.com/");
  assert.equal(normalizeExternalUrl("mailto:test@example.com"), "mailto:test@example.com");
});

test("normalizeExternalUrl rejects unsafe protocols", () => {
  assert.throws(() => normalizeExternalUrl("javascript:alert(1)"), /interdit/);
  assert.throws(() => normalizeExternalUrl("file:///etc/passwd"), /interdit/);
  assert.throws(() => normalizeExternalUrl("data:text/plain,test"), /interdit/);
});

test("normalizePermissionValue only keeps supported values", () => {
  assert.equal(normalizePermissionValue("allow"), "allow");
  assert.equal(normalizePermissionValue("block"), "block");
  assert.equal(normalizePermissionValue("ask"), "ask");
  assert.equal(normalizePermissionValue("bad", "block"), "block");
});

test("expandHomePath expands only home-prefixed paths", () => {
  assert.equal(expandHomePath("~/Downloads", "/Users/test"), path.join("/Users/test", "Downloads"));
  assert.equal(expandHomePath("/tmp/file", os.homedir()), "/tmp/file");
});

test("safeDownloadFilename strips path traversal", () => {
  assert.equal(safeDownloadFilename("../../secret.txt"), "secret.txt");
  assert.equal(safeDownloadFilename(""), "download");
});
