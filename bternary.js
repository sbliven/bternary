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
 * Compute a+b
 * Inputs: two balanced ternary numbers, in -0+ notation
 */
function add(a, b) {
    var r = "";
    
    //align decimal places
    aligned = alignDecimals(a,b);
    a = aligned[0]
    b = aligned[1]
    

    var carry=0;
    for(var i=a.length-1;i>=0;i--) {
        var sum = 0;
        var cA = a[i];
        var cB = b[i];
        
        // ignore decimal place position
        if(cA == '.') {
            if(cB != '.') { quit("Internal Error: unaligned decimal places"); return; }
            r = "."+r;
            continue;
        }
        
        // compute sum of these digits
        switch(cA) {
        case '-': sum -= 1; break;
        case '0': break;
        case '+': sum += 1; break;
        default: quit("Error: invalid ternary number "+a); return;
        }
        switch(cB) {
        case '-': sum -= 1; break;
        case '0': break;
        case '+': sum += 1; break;
        default: quit("Error: invalid ternary number "+b); return;
        }
        sum += carry;
        
        // convert sum into digit+carry
        switch(sum) {
        case -3: carry=-1; r = "0"+r; break;
        case -2: carry=-1; r = "+"+r; break;
        case -1: carry=0; r = "-"+r; break;
        case 0: carry=0; r = "0"+r; break;
        case 1: carry=0; r = "+"+r; break;
        case 2: carry=1; r = "-"+r; break;
        case 3: carry=1; r = "0"+r; break;
        default: quit("Internal error"); return;
        }
        
    }
    
    // Check for overflow
    switch(carry) {
    case -1: r = "-"+r; break;
    case 0: break;
    case 1: r = "+"+r; break;
    default: quit("Internal error"); return;
    }    

    return toCannonical(r);
}
/**
 * Compute a-b
 * Inputs: two balanced ternary numbers, in -0+ notation
 */
function sub(a, b) {
    return add(a, neg(b));
}
/**
 * Compute a*b
 * Inputs: two balanced ternary numbers, in -0+ notation
 * 
 * Uses a simple shift-and-add algorithm
 */
function mult(a,b) {
    var r = "0";
    
    var decB = b.indexOf('.');
    
    var shift = (decB<0)?0:decB-b.length+1;
    for(var i=b.length-1;i>=0;i--) {
        switch(b[i]) {
        case '.': continue;
        case '-': r = add(r, neg(lshift(a, shift)) ); break;
        case '0': break;
        case '+':
            var shiftedA = lshift(a, shift);
            r = add(r, shiftedA);
            break;
        default: quit("Error: invalid ternary number "+a); return;
        }
        
        shift++;
    }
    
    return toCannonical(r);
}

/* Compute a/b
 * Inputs: two balanced ternary numbers, in -0+ notation. Optionally, the number of digits
 *         precision to store (default 10).
 *
 * Uses a long division algorithm, terminating after the specified precision is reached.
 * Note that some rational numbers have two equivalent balanced ternary representations
 * (eg 1/2 = +/+- = 0.+++++... = +.-----...). In such cases, the one with fewer digits
 * is returned, although this behavior should not be counted on.
 */
function div(a,b, prec) {
    // a    dividend
    // b    divisor
    // q    quotient
    // r    remainder
    var q="";
    var r="";
    
    // Shift decimal point so that the divisor is integral
    var decB = b.indexOf('.');
    if(decB>=0) {
        var shift = b.length-decB-1;
        a = lshift(a,shift);
        b = lshift(b,shift);
    }
    
    // By default, store 10 bits of fractional precision    
    if(typeof prec == "undefined") {
        prec = 10;
    }
    
    var bneg = neg(b);
    
    var decA = a.indexOf('.');
    if(decA<0) decA=a.length;
    
    for(var pos=0;pos<=decA+prec;pos++) {
        if(pos == decA) {
            q+='.';
            continue;
        }
        
        //append a digit to the remainder
        r += pos<a.length?a[pos]:'0';
        
        // Add a zero to the quotient if the remainder is less than the divisor
        if( lt(abs(r), abs(b)) ) {
            q+='0';
        } else {
            if( sign(r) == sign(b) ) {
                q+='+';
                r=add(r,bneg);
            } else {
                q+='-';
                r=add(r,b);
            }
        }
    }
    
    return toCannonical(q);
}

/* Left shift, aka multiplication by 3.
 * Inputs: A balanced ternary numbers, in -0+ notation, and an integer giving the number
 *         of places to shift.
 * Example: lshift('+.-',2) == '+-0'
 *
 * Negative shift amounts are equivalent to right shifting an equal amount.
 */
function lshift(a, shift) {
    var r;
    var decA = a.indexOf('.');
    if(decA<0) decA = a.length;
    
    if(shift>=0) { //shift left
        r=a.substr(0,decA)
        r+=a.substr(decA+1,shift)
        // add leading zeros
        for(var i=r.length;i< decA+shift;i++) {
            r+="0";
        }
        if(decA+shift<a.length-1) {
            r+="."
            r+=a.substr(decA+shift+1)
        }
    } else { //shift right
        r=a.substr(0,decA+shift);
        r+=".";
        //add leading zeros
        for(var i=decA+shift-r.length+1;i<0;i++) {
            r+="0";
        }
        r+=a.substring(decA+shift,decA);
        r+=a.substr(decA+1);
    }
    return toCannonical(r);
}
/* Right shift, aka division by 3.
 * Inputs: A balanced ternary numbers, in -0+ notation, and an integer giving the number
 *         of places to shift.
 * Example: rshift('+-0',2) == '+.-0'
 *
 * Negative shift amounts are equivalent to left shifting an equal amount.
 */
function rshift(a, shift) { return lshift(a, -shift); }

/**
 * Returns '-' if a<b, '0' for a==b, and '+' for a>b
 */
function compare(a,b) {
    //align decimal places
    aligned = alignDecimals(a,b);
    a = aligned[0]
    b = aligned[1]
    
    for(var i=0;i<a.length;i++) {
        switch(b[i]) {
        case '-':
            if(a[i] != '-') {
                return '+'
            }
            break;
        case '0':
            if(a[i] != '0' ) {
                return a[i];
            }
            break;
        case '+':
            if(a[i] != '+' ) {
                return '-';
            }
            break;
        default:
        }
    }
    
    return '0';
}

/**
 * Returns true if a<b
 */
function lt(a,b) { return compare(a,b)=='-'; }
/**
 * Returns true if a>b
 */
function gt(a,b) { return compare(a,b)=='+'; }
/**
 * Returns true if a<=b
 */
function leq(a,b) { return compare(a,b)!='+'; }
/**
 * Returns true if a>=b
 */
function geq(a,b) { return compare(a,b)!='-'; }

/**
 * Returns the absolute value of a
 */
function abs(a) {
    for(var i=0;i<a.length;i++) {
        switch(a[i]) {
        case '+': return a;
        case '-': return neg(a);
        case '0':
        case '.': break;
        default: return quit("Error: invalid ternary number "+a);
        }
    }
    return a; //must be 0
}

/**
 * Returns the sign (the first bit) of a, in '-0+' notation
 */
function sign(a) {
    for(var i=0;i<a.length;i++) {
        if(a[i] != '0' && a[i] != '.' ) {
            return a[i];
        }
    }
    return '0'; //must be 0
}

/**
 * return -a
 */
function neg(a) {
    var r = ""
    for(var i=0;i<a.length;i++) {
        switch(a[i]) {
        case '+': r += '-'; break;
        case '-': r += '+'; break;
        default: r += a[i]; break;
        }
    }
    return r
}

/**
 * Pads a and/or b with zeros so that they have the same number of digits and their
 * decimal places are aligned.
 * Returns a 2-element array containing the aligned [a,b] 
 */
function alignDecimals(a,b) {
    var decA = a.indexOf('.');
    var decB = b.indexOf('.');
    
    var intA, intB; //length of integer part before decimal
    var fracA,fracB; //length of fractional part after decimal
    
    if(decA<0) {
        intA = a.length;
        fracA = 0;
    } else {
        intA = decA;
        fracA = a.length-decA-1;
    }

    if(decB<0) {
        intB = b.length;
        fracB = 0;
    } else {
        intB = decB;
        fracB = b.length-decB-1;
    }

    var intL = Math.max(intA,intB)
    var fracL = Math.max(fracA,fracB)
    
    var newA = "";
    for(var i=intA; i<intL;i++) {
        newA += "0";
    }
    newA += a;
    if(decA<0 && fracL>0) {
        newA += ".";
    }
    for(var i=fracA;i<fracL;i++) {
        newA += "0";
    }
    
    var newB = "";
    for(var i=intB; i<intL;i++) {
        newB += "0";
    }
    newB += b;
    if(decB<0 && fracL>0) {
        newB += ".";
    }
    for(var i=fracB;i<fracL;i++) {
        newB += "0";
    }
    
    return [newA,newB];
}

/**
 * Converts a balanced ternary number to decimal
 * Input: A string containing a balanced ternary number, in -0+ notation.
 * Output: A Number approximating the input
 *
 * Note that converting fractions from ternary to binary can result in fairly significant
 * loss of precision, since most finite ternary numbers have infinitely repeating binary
 * approximations.
 */
function ternaryToNumber(a) {
    var sum=0;
    
    var decA = a.indexOf('.');
    if(decA<0) decA = a.length;
    
    // Integer part
    var pow = 1;
    for(var i=decA-1;i>=0;i--) {
        var digit;
        switch(a[i]) {
        case '-': digit=-1; break;
        case '0': digit=0; break;
        case '+': digit=1; break;
        default: quit("Error: invalid ternary number "+a); return;
        }
        
        sum += pow*digit;
        pow*=3;
    }
    
    // Fractional part
    pow = 3;
    for(var i=decA+1;i<a.length;i++) {
        var digit;
        switch(a[i]) {
        case '-': digit=-1; break;
        case '0': digit=0; break;
        case '+': digit=1; break;
        default: quit("Error: invalid ternary number "+a); return;
        }
        
        sum += digit/pow;
        pow*=3;
    }
    
    return sum;
}

/**
 * Converts a balanced ternary number to decimal
 *
 * Input: A Number, to be converted; an optional precision (default 10); and an optional
 *        character specifying the rounding direction (default '-')
 * Output: A string containing a balanced ternary number, in -0+ notation.
 *
 * Note that converting fractions from binary to ternary can result in fairly significant
 * loss of precision, since most finite binary numbers have infinitely repeating ternary
 * approximations.
 *
 * Some rational numbers have two equivalent balanced ternary representations
 * (eg 1/2 = +/+- = 0.+++++... = +.-----...). In such cases, dir parameter determines 
 * which alternative to round:
 *  * -    round near-integer bits towards 0
 *  * +    round near-integer bits away from zero
 *
 * See numberToTernaries() if all possible representations are required
 */
function numberToTernary(n, prec, dir) {
    // dir biases the direction we round bits
    // -    round near-integer bits towards 0
    // +    round near-integer bits away from zero
    // 0    follow both rounding possibilities
    if(typeof dir == "undefined") {
        dir = "-";
    }
    // By default, store 10 bits of fractional precision    
    if(typeof prec == "undefined") {
        prec = 10;
    }
    return numberToTernaries(n, prec, dir)[0];
}
/**
 * Converts a balanced ternary number to decimal
 *
 * Input: A Number, to be converted; an optional precision (default 10); and an optional
 *        character specifying the rounding direction (default '0')
 * Output: An array of strings containing balanced ternary numbers, in -0+ notation.
 *
 * Note that converting fractions from binary to ternary can result in fairly significant
 * loss of precision, since most finite binary numbers have infinitely repeating ternary
 * approximations.
 *
 * Some rational numbers have two equivalent balanced ternary representations
 * (eg 1/2 = +/+- = 0.+++++... = +.-----...). In such cases, dir parameter determines 
 * which alternative to round:
 *  * -    round near-integer bits towards 0
 *  * +    round near-integer bits away from zero
 *  * 0    follow both rounding possibilities
 *
 * See numberToTernary() if only one rounding possibility is required
 */
function numberToTernaries(n,prec, dir) {
    // dir biases the direction we round bits
    // -    round near-integer bits towards 0
    // +    round near-integer bits away from zero
    // 0    follow both rounding possibilities
    if(typeof dir == "undefined") {
        dir = "0";
    }
    // By default, store 10 bits of fractional precision    
    if(typeof prec == "undefined") {
        prec = 10;
    }
    
    // Find the number of bits needed
    var log3 = Math.log(Math.abs(2*n))/Math.log(3)
    var log3Int = Math.round(log3)
    var biforcation = Math.abs( log3Int - log3 ) < 1e-10;

    var bits;
    if(biforcation) {
        switch(dir) {
        case '-': bits = log3Int-1; break;
        case '+': bits = log3Int; break;
        case '0':
            var left,right;
            left = numberToTernaries(n, prec, '-');
            right = numberToTernaries(n, prec, '+');
        
            return left.concat(right);
        default: quit("Error: illegal dir parameter"); return;
        }
    } else {
        bits = Math.ceil(log3)-1;
    }



    // Base case
    if(n == 0 || prec < -bits) {
        return ["0"];
    }
    
    // Calculate MSD and recurse
    var msd, remainder;
    if( n>0 ) {
        msd = "+";
        remainder = n-Math.pow(3,bits)
    } else {
        msd = "-";
        remainder = n+Math.pow(3,bits)
    }
    
    msd = lshift(msd, bits);
    
    //log(n+" = "+msd+" + "+remainder);
        
    // detect infinite oscilations.
    if(n == -remainder) {
        if(  dir = "+" ) {
            dir = "-";
        } else {
            log("Error: oscillating between "+n+" and "+remainder)
            return [""]
        }
    }
    
    // recurse
    var fracs = numberToTernaries(remainder, prec,dir);
    var r = fracs.map(function(x) {return add( msd, x );});
    return r.map(toCannonical);
}

/* Remove leading and training zeros */
function toCannonical(a) {
    var s=0;
    var e=a.length;
    while(a[s]=='0') s++;
    if(a.indexOf('.')>=0) {
        while(a[e-1]=='0') e--;
    }
    if(a[e-1] == '.') e--;
    
    var r = a.substring(s,e);
    if(r.length<1 || r[0] == '.') {
        r = "0"+r;
    }
    return r;
}

// Utility functions
if(typeof quit == "undefined") {
    function quit(str) {
        alert(str)
    }
}

log = (function() {
    // If a console is available, use it to log
    if(typeof console != "undefined") {
        return function(msg) {
            return console.log(msg);
        }
    } else {
        // otherwise, try the print function
        return print;
    }
})();