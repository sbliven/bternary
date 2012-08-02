// BTernary
// Copyright © 2012 Spencer Bliven
// 
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.
// 
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
// 
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

/**
 * Some tests for bternary.js
 *
 * To run: `jsc bternary.js btTests.js`
 * Outputs 'All tests passed' upon success.
 */

function eq(a,b) {return JSON.stringify(a) == JSON.stringify(b);}
function eqf(a,b,prec) {return Math.abs(a-b)<(prec?prec:1e-14);}
function test() { 
(function(x) {for(var i=0;i<x.length;i++) {if(!x[i]) console.log(i+": false");} return x;})(
[
eq( neg("++0-.++000-00"),               "--0+.--000+00" ),
eq( neg("0"),                           "0" ),
eq( neg("+"),                           "-" ),
eq( neg("-"),                           "+" ),

eq( alignDecimals("+.000","---"),       ["00+.000", "---.000"] ),
eq( alignDecimals(".0",".-"),           [".0", ".-"] ),
eq( alignDecimals(".0","0."),           ["0.0", "0.0"] ),
eq( alignDecimals("+","0"),             ["+", "0"] ),

eq( toCannonical("000+.+000"),          "+.+" ),
eq( toCannonical("000+.000"),           "+" ),
eq( toCannonical("000.+000"),           "0.+" ),
eq( toCannonical(".+000"),              "0.+" ),
eq( toCannonical("+000"),               "+000" ),
eq( toCannonical("-000.000"),           "-000" ),

eq( add("+","-"),                       "0" ),
eq( add("+","0"),                       "+" ),
eq( add("+","+"),                       "+-" ),
eq( add("-","-"),                       "-+" ),
eq( add("-","+"),                       "0" ),
eq( add("-","0"),                       "-" ),
eq( add(".+",".-"),                     "0" ),
eq( add(".+",".+"),                     "+.-" ),

eq( sub("+00+","+--.+"),                "+0--.-" ),

eqf( ternaryToNumber("+"),              1 ),
eqf( ternaryToNumber("-"),              -1 ),
eqf( ternaryToNumber("0"),              0 ),
eqf( ternaryToNumber("0.0"),            0 ),
eqf( ternaryToNumber(".+"),             1/3 ),
eqf( ternaryToNumber("+.-"),            2/3 ),
eqf( ternaryToNumber("+--+"),           16 ),
eqf( ternaryToNumber("+0000"),          81 ),
eqf( ternaryToNumber("-0000"),          -81 ),
eqf( ternaryToNumber("++-0+"),          100 ),
eqf( ternaryToNumber(".+++++++++++++++++++++"),.5,1e-10), // converges slowly
eqf( ternaryToNumber("+.---------------------"),.5,1e-10), // converges slowly

eq( numberToTernary(1),                 "+" ),
eq( numberToTernary(-1),                "-" ),
eq( numberToTernary(0),                 "0" ),
eq( numberToTernary(3),                 "+0" ),
eq( numberToTernary(9),                 "+00" ),
eq( numberToTernary(12),                "++0" ),
eq( numberToTernary(100),               "++-0+" ),
eq( numberToTernary(-3),                "-0" ),
eq( numberToTernary(-12),               "--0" ),
eq( numberToTernary(1/3),               "0.+" ),
eq( numberToTernary(-1/3),              "0.-" ),
eq( numberToTernary(-2/9),              "0.-+" ),
eq( numberToTernary(1/2),               "0.++++++++++" ),
eq( numberToTernary(1/2,3),             "0.+++" ),
eq( numberToTernary(-1/2),              "0.----------" ),
eq( numberToTernaries(1/2),             ["0.++++++++++", "+.----------"] ),
eq( numberToTernaries(1/6,3),           ["0.0++", "0.+--"] ),
eq( numberToTernaries(1/27),            ["0.00+"] ),

eq(lshift("+-.0+",0),                   "+-.0+" ),
eq(lshift("+-.0+",-1),                  "+.-0+" ),
eq(lshift("+-.0+",-2),                  "0.+-0+" ),
eq(lshift("+-.0+",-3),                  "0.0+-0+" ),
eq(lshift("+-.0+",-4),                  "0.00+-0+" ),
eq(lshift("+-.0+",1),                   "+-0.+" ),
eq(lshift("+-.0+",2),                   "+-0+" ),
eq(lshift("+-.0+",3),                   "+-0+0" ),
eq(lshift("+-.0+",5),                   "+-0+000" ),
eq(lshift(".0+",-2),                    "0.000+" ),
eq(lshift("+-",2),                      "+-00" ),

eq(mult("+-+","+"),                     "+-+"),
eq(mult("+-+.+","-"),                   "-+-.-"),
eq(mult("+-+.+","+-.+"),                "+-0-.0+"),
eq(mult(".00+","+000"),                 "+"),
eq(mult("+-+.+","+-.+"),                "+-0-.0+"),
eq(mult("+-+.+","+-.+"),                "+-0-.0+"),
eq(mult("+-+.+","+-.+"),                "+-0-.0+"),

eq(compare("-","+"),                    "-"),
eq(compare("0","+"),                    "-"),
eq(compare("+","+"),                    "0"),
eq(compare("+","-"),                    "+"),
eq(compare("+","0"),                    "+"),
eq(compare("-","-"),                    "0"),
eq(compare("++-","++0"),                "-"),
eq(compare("0.0000+","0.0000++"),       "-"),
eq(compare("+0","+.0"),                 "+"),

 lt("-","+"),
!lt("++","+"),
!lt("0","0.0"),
!gt("-","+"),
 gt("++","+"),
!gt("0","0.0"),
 leq("-","+"),
!leq("++","+"),
 leq("0","0.0"),
!geq("-","+"),
 geq("++","+"),
 geq("0","0.0"),

eq(abs("+--+.--"),                      "+--+.--" ),
eq(abs("---+.--"),                      "+++-.++" ),
eq(abs("0.00-"),                        "0.00+" ),
eq(abs("000.0000"),                     "000.0000" ),

eq(sign("+000-.0"),                     "+" ),
eq(sign("-000-.0"),                     "-" ),
eq(sign("000-.0"),                      "-" ),
eq(sign("0.000-0"),                     "-" ),
eq(sign("000.00"),                      "0" ),

eq(div("+--+","++"),                    "++"),
eq(div("+--.+","++"),                   "+.+"),
eq(div(".+--+","++"),                   "0.00++"),
eq(div("+","+0"),                       "0.+"),
eq(div("+","+00"),                      "0.0+"),
eq(div("+","+-",4),                     "0.++++"),
eq(div("+-0.+","-"),                    "-+0.-"),
eq(div("+--+","+.+"),                   "++0"),
eq(div("+--0",".+"),                    "+--00"),
eq(div("+--0","0.+"),                   "+--00"),


]
).reduceRight(function(a,b) {return a&&b;}) &&
log("All tests passed")
}

test()