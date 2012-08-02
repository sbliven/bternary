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

/* Event handlers for the bternary calculator
 *
 * Requires the bternary.js library
 */
 
/**
 * Converts a decimal number to ternary
 * @param input INPUT DOM element containing decimal input
 * @param output INPUT DOM element where balanced ternary is output
 * @param error (optional) DIV DOM element to output error messages
 */
function convertDtoBT(input,output, error) {
    if( validateDecimal(input.value) ) {
        //validation passed
        if(typeof error != "undefined") {
            error.innerText = "";
        }
        
        var d = Number(input.value);
        var bt = numberToTernary(d);
        output.value = bt;
    } else {
        //validation failed
        if(typeof error != "undefined") {
            error.innerText = "Invalid decimal number";
        }
    }
}

/**
 * Converts a decimal number to ternary
 * @param input INPUT DOM element containing balanced ternary input
 * @param output INPUT DOM element where decimal is output
 * @param error (optional) DIV DOM element to output error messages
 */
function convertBTtoD(input,output, error) {
    if( validateTernary(input.value) ) {
        //validation passed
        if(typeof error != "undefined") {
            error.innerText = "";
        }
        
        var bt = input.value;
        var d = ternaryToNumber(bt);
        output.value = d;
    } else {
        //validation failed
        if(typeof error != "undefined") {
            error.innerText = "Invalid ternary number";
        }
    }
}

/**
 * Calculate with ternary numbers
 * @param in1 INPUT DOM element containing first balanced ternary input
 * @param in2 INPUT DOM element containing second balanced ternary input
 * @param operator SELECT DOM element with +,-,x,÷ options
 * @param out INPUT DOM element where output is stored
 * @param error (optional) DIV DOM element to output error messages
 */
function calculate(in1,operator,in2, out, error) {
    var a = in1.value;
    var b = in2.value;
    if(validateTernary(a) && validateTernary(b) ) {
        //validation passed
        if(typeof error != "undefined") {
            error.innerText = "";
        }
        
        var r = "";
        switch(operator.selectedIndex) {
        case 0: //+
            r = add(a,b);
            break;
        case 1: //-
            r = sub(a,b);
            break;
        case 2: //*
            r = mult(a,b);
            break;
        case 3: //÷
            r = div(a,b);
            break;
        }
        
        out.value = r;
    } else {
        //validation failed
        if(typeof error != "undefined") {
            error.innerText = "Invalid ternary number";
        }
        
        out.value = "";
    }
}

/**
 * Validate whether the input string is a valid decimal number
 */
validateDecimal = (function() {
    //var patt=/^\s*([0-9]+|[0-9]*(\.[0-9]+))\s*$/; //too strict for partially typed numbers
    var patt=/^\s*[0-9]*(\.[0-9]*)?\s*$/;
    patt.compile(patt);
    
    return function(numStr) {
        return patt.test(numStr);
    }
})()

/**
 * Validate whether the input string is a valid balanced ternary (-0+) number
 */
validateTernary = (function() {
    //var patt=/^\s*([-0+]+|[-0+]*(\.[-0+]+))\s*$/; //too strict
    var patt=/^\s*[-0+]*(\.[-0+]*)?\s*$/;
    patt.compile(patt);
    
    return function(numStr) {
        return patt.test(numStr);
    }
})()