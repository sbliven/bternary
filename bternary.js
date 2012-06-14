/*
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
function sub(a, b) {
    return add(a, neg(b));
}

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

/* Compute a/q
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
/* Left shift, aka multiplication by 3
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
function rshift(a, shift) { return lshift(a, -shift); }

/* Returns '-' if a<b, '0' for a=b, and '+' for a>b
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

function lt(a,b) { return compare(a,b)=='-'; }
function gt(a,b) { return compare(a,b)=='+'; }
function leq(a,b) { return compare(a,b)!='+'; }
function geq(a,b) { return compare(a,b)!='-'; }

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

function sign(a) {
    for(var i=0;i<a.length;i++) {
        if(a[i] != '0' && a[i] != '.' ) {
            return a[i];
        }
    }
    return '0'; //must be 0
}

// return -a
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

if(typeof quit == "undefined") {
    function quit(str) {
        alert(str)
    }
}

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
    
    //console.log(n+" = "+msd+" + "+remainder);
        
    // detect infinite oscilations.
    if(n == -remainder) {
        if(  dir = "+" ) {
            dir = "-";
        } else {
            console.log("Error: oscillating between "+n+" and "+remainder)
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

// TEST CASES
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
console.log("All tests passed")
}

//test()