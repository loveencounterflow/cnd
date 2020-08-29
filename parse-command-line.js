// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
// see https://doc.deno.land/https/deno.land/std@0.61.0/flags/mod.ts
// import { assert } from "../_util/assert.ts";

function assert( x ) {
    if ( x === true ) { return; };
    throw new Error( "wrong" ); }

function get(obj, key) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return obj[key];
    }
}
function getForce(obj, key) {
    const v = get(obj, key);
    assert(v != null);
    return v;
}
function isNumber(x) {
    if (typeof x === "number")
        return true;
    if (/^0x[0-9a-f]+$/i.test(String(x)))
        return true;
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x));
}
function hasKey(obj, keys) {
    let o = obj;
    keys.slice(0, -1).forEach((key) => {
        var _a;
        o = ((_a = get(o, key)) !== null && _a !== void 0 ? _a : {});
    });
    const key = keys[keys.length - 1];
    return key in o;
}
/** Take a set of command line arguments, with an optional set of options, and
 * return an object representation of those argument.
 *
 *      const parsedArgs = parse(Deno.args);
 */
module.exports = function parse(args, { "--": doubleDash = false, alias = {}, boolean = false, default: defaults = {}, stopEarly = false, string = [], unknown = (i) => i, } = {}) {
    var _a;
    const flags = {
        bools: {},
        strings: {},
        unknownFn: unknown,
        allBools: false,
    };
    if (boolean !== undefined) {
        if (typeof boolean === "boolean") {
            flags.allBools = !!boolean;
        }
        else {
            const booleanArgs = typeof boolean === "string" ? [boolean] : boolean;
            for (const key of booleanArgs.filter(Boolean)) {
                flags.bools[key] = true;
            }
        }
    }
    const aliases = {};
    if (alias !== undefined) {
        for (const key in alias) {
            const val = getForce(alias, key);
            if (typeof val === "string") {
                aliases[key] = [val];
            }
            else {
                aliases[key] = val;
            }
            for (const alias of getForce(aliases, key)) {
                aliases[alias] = [key].concat(aliases[key].filter((y) => alias !== y));
            }
        }
    }
    if (string !== undefined) {
        const stringArgs = typeof string === "string" ? [string] : string;
        for (const key of stringArgs.filter(Boolean)) {
            flags.strings[key] = true;
            const alias = get(aliases, key);
            if (alias) {
                for (const al of alias) {
                    flags.strings[al] = true;
                }
            }
        }
    }
    const argv = { _: [] };
    function argDefined(key, arg) {
        return ((flags.allBools && /^--[^=]+$/.test(arg)) ||
            get(flags.bools, key) ||
            !!get(flags.strings, key) ||
            !!get(aliases, key));
    }
    function setKey(obj, keys, value) {
        let o = obj;
        keys.slice(0, -1).forEach(function (key) {
            if (get(o, key) === undefined) {
                o[key] = {};
            }
            o = get(o, key);
        });
        const key = keys[keys.length - 1];
        if (get(o, key) === undefined ||
            get(flags.bools, key) ||
            typeof get(o, key) === "boolean") {
            o[key] = value;
        }
        else if (Array.isArray(get(o, key))) {
            o[key].push(value);
        }
        else {
            o[key] = [get(o, key), value];
        }
    }
    function setArg(key, val, arg = undefined) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg, key, val) === false)
                return;
        }
        const value = !get(flags.strings, key) && isNumber(val) ? Number(val) : val;
        setKey(argv, key.split("."), value);
        const alias = get(aliases, key);
        if (alias) {
            for (const x of alias) {
                setKey(argv, x.split("."), value);
            }
        }
    }
    function aliasIsBoolean(key) {
        return getForce(aliases, key).some((x) => typeof get(flags.bools, x) === "boolean");
    }
    for (const key of Object.keys(flags.bools)) {
        setArg(key, defaults[key] === undefined ? false : defaults[key]);
    }
    let notFlags = [];
    // all args after "--" are not parsed
    if (args.includes("--")) {
        notFlags = args.slice(args.indexOf("--") + 1);
        args = args.slice(0, args.indexOf("--"));
    }
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (/^--.+=/.test(arg)) {
            const m = arg.match(/^--([^=]+)=(.*)$/s);
            assert(m != null);
            const [, key, value] = m;
            if (flags.bools[key]) {
                const booleanValue = value !== "false";
                setArg(key, booleanValue, arg);
            }
            else {
                setArg(key, value, arg);
            }
        }
        else if (/^--no-.+/.test(arg)) {
            const m = arg.match(/^--no-(.+)/);
            assert(m != null);
            setArg(m[1], false, arg);
        }
        else if (/^--.+/.test(arg)) {
            const m = arg.match(/^--(.+)/);
            assert(m != null);
            const [, key] = m;
            const next = args[i + 1];
            if (next !== undefined &&
                !/^-/.test(next) &&
                !get(flags.bools, key) &&
                !flags.allBools &&
                (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                setArg(key, next, arg);
                i++;
            }
            else if (/^(true|false)$/.test(next)) {
                setArg(key, next === "true", arg);
                i++;
            }
            else {
                setArg(key, get(flags.strings, key) ? "" : true, arg);
            }
        }
        else if (/^-[^-]+/.test(arg)) {
            const letters = arg.slice(1, -1).split("");
            let broken = false;
            for (let j = 0; j < letters.length; j++) {
                const next = arg.slice(j + 2);
                if (next === "-") {
                    setArg(letters[j], next, arg);
                    continue;
                }
                if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
                    setArg(letters[j], next.split("=")[1], arg);
                    broken = true;
                    break;
                }
                if (/[A-Za-z]/.test(letters[j]) &&
                    /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(letters[j], next, arg);
                    broken = true;
                    break;
                }
                if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                    setArg(letters[j], arg.slice(j + 2), arg);
                    broken = true;
                    break;
                }
                else {
                    setArg(letters[j], get(flags.strings, letters[j]) ? "" : true, arg);
                }
            }
            const [key] = arg.slice(-1);
            if (!broken && key !== "-") {
                if (args[i + 1] &&
                    !/^(-|--)[^-]/.test(args[i + 1]) &&
                    !get(flags.bools, key) &&
                    (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                    setArg(key, args[i + 1], arg);
                    i++;
                }
                else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
                    setArg(key, args[i + 1] === "true", arg);
                    i++;
                }
                else {
                    setArg(key, get(flags.strings, key) ? "" : true, arg);
                }
            }
        }
        else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                argv._.push(((_a = flags.strings["_"]) !== null && _a !== void 0 ? _a : !isNumber(arg)) ? arg : Number(arg));
            }
            if (stopEarly) {
                argv._.push(...args.slice(i + 1));
                break;
            }
        }
    }
    for (const key of Object.keys(defaults)) {
        if (!hasKey(argv, key.split("."))) {
            setKey(argv, key.split("."), defaults[key]);
            if (aliases[key]) {
                for (const x of aliases[key]) {
                    setKey(argv, x.split("."), defaults[key]);
                }
            }
        }
    }
    if (doubleDash) {
        argv["--"] = [];
        for (const key of notFlags) {
            argv["--"].push(key);
        }
    }
    else {
        for (const key of notFlags) {
            argv._.push(key);
        }
    }
    return argv;
}