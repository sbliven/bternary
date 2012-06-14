/* Event handlers for the bternary calculator
 *
 * Requires the bternary.js library
 */
 

function convertDtoBT(input,output) {
    var d = Number(input.value);
    var bt = numberToTernary(d);
    output.value = bt;
}

function convertBTtoD(input,output) {
    var bt = input.value;
    var d = ternaryToNumber(bt);
    output.value = d;
}

function calculate(in1,operator,in2, out) {
    var a = in1.value;
    var b = in2.value;
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
}
        