function solveTheSudoku() {
    let vals = document.getElementById("input-sudoku-string").value;

    let s = new Sudoku(vals.split(""));
    if (!s.rcnValid()) {
        alert("not a valid sudoki fam");
    }

    while(!s.complete) {
        s.solve();
    }
    document.getElementById("solved-sudoku-string").value = s.val;
    console.log(s.constraints);
}

function Sudoku(vals){
    this.constraints = [];
    this.backtrackPoint = [];
    this.backtrackVals = [];
    this.needBacktrack = false;
    this.constraintsR = [];
    this.constraintsC = [];
    this.constraintsN = [];
    this.rows = [];
    this.cols = [];
    this.nines = [];
    this.val = vals;
    this.complete = false;

    this.generateRows();
    this.generateCols();
    this.generateNines();
    this.generateConstraints();
}
Sudoku.prototype.generateRows = function () {
    let re = [];
    for (let i = 0; i < 9; i++) {
        let tempRow = [];
        for (let j = 0; j < 9; j++)
            tempRow.push(this.val[(i*9) + j]);
        re.push(tempRow);
    }
    this.rows = re;
};

//Must be called after generateRows is called
Sudoku.prototype.generateCols = function() {
    let ce = [];
    for (let i = 0; i < 9; i++) {
        let tempCol = [];
        for (let j = 0; j < 9; j++) {
            let t = this.rows[j];
            tempCol.push(t[i]);
        }
        ce.push(tempCol);
    }
    this.cols = ce;
};

Sudoku.prototype.generateNines = function () {
    let ne = [];
    let splitter = 0;
    for(let i = 0; i < 9; i++) {
        let tempNine = [];
        tempNine.push(this.val[splitter]);
        tempNine.push(this.val[splitter+1]);
        tempNine.push(this.val[splitter+2]);
        tempNine.push(this.val[splitter+9]);
        tempNine.push(this.val[splitter+10]);
        tempNine.push(this.val[splitter+11]);
        tempNine.push(this.val[splitter+18]);
        tempNine.push(this.val[splitter+19]);
        tempNine.push(this.val[splitter+20]);
        if (((i+1) % 3) === 0) splitter += 21;
        else splitter += 3;
        ne.push(tempNine);
    }
    this.nines = ne;
};

function isNineValid (x) {
    let first = x.shift();
    if (x.length === 0) return true;
    for (let i = 0; i < x.length; i++)
        if (x[i] === first && x[i] !== ".")
            return false;
    return isNineValid(x);
}

Sudoku.prototype.rcnValid = function () {
    let r = jQuery.extend(true, {}, this.rows);
    let c = jQuery.extend(true, {}, this.cols);
    let n = jQuery.extend(true, {}, this.nines);
    for (let i = 0; i < 9; i++)
        if (!isNineValid(r[i])
            || !isNineValid(c[i])
            || !isNineValid(n[i])) return false;
    return true;
};

function boxLookup(x, y) {
    x+=1;
    y+=1;
    if (x <= 3 && y <= 3) return 0;
    else if (x <= 3 && y <= 6) return 1;
    else if (x <= 3 && y <= 9) return 2;
    else if (x <= 6 && y <= 3) return 3;
    else if (x <= 6 && y <= 6) return 4;
    else if (x <= 6 && y <= 9) return 5;
    else if (x <= 9 && y <= 3) return 6;
    else if (x <= 9 && y <= 6) return 7;
    else if (x <= 9 && y <= 9) return 8;
}

Sudoku.prototype.generateConstraints = function () {
    for (let i = 0; i < 9; i++) {
        this.constraintsR.push(constraintsOfABlock(this.rows[i]));
        this.constraintsC.push(constraintsOfABlock(this.cols[i]));
        this.constraintsN.push(constraintsOfABlock(this.nines[i]));
    }
    this.rcnToConstraints();
};

Sudoku.prototype.upConstraints = function () {
    this.generateRows();
    this.generateCols();
    this.generateNines();
    this.constraintsR = [];
    this.constraintsC = [];
    this.constraintsN = [];
    this.generateConstraints();
};

Sudoku.prototype.rcnToConstraints = function rcnToConstraints() {
    if (this.val.indexOf(".") === -1) {
        this.complete = true;
    }
    else {
        let temp = [];
        for (let i = 0; i < 81; i++) {
            let x = Math.floor(i / 9);
            let y = i % 9;
            let z = boxLookup(x, y);
            let int = array_intersect(this.constraintsR[x],
                this.constraintsC[y],
                this.constraintsN[z]);
            if (this.val[i] === ".") {
                if (int.length === 0) this.needBacktrack = true;
                temp.push(int);
            }
            else {
                temp.push([]);
            }
        }
        this.constraints = temp;
    }
};

function constraintsOfABlock(blockOfNine) {
    let a = ["1","2","3","4","5","6","7","8","9"];
    for (let i = 0; i < blockOfNine.length; i++) {
        if (blockOfNine[i] === ".") continue;
        let index = a.indexOf(blockOfNine[i]);
        if (index !== -1) a.splice(index,1);
    }
    return a;
}

//TODO: Make this code actually work because it would be far more efficient to do it this way because we currently have to generate every constraint at every iteration which is god awful.
Sudoku.prototype.updateConstraints = function (indice, value) {
    this.constraints = [];
    let r = Math.floor(indice / 9);
    let c = indice % 9;
    let n = boxLookup(r,c);
    let indR = this.constraintsR[r].indexOf(value);
    if (indR > -1) this.constraintsR[r].splice(indR, 1);
    let indC = this.constraintsC[c].indexOf(value);
    if (indC > -1) this.constraintsC[c].splice(indC, 1);
    let indN = this.constraintsN[n].indexOf(value);
    if (indN > -1) this.constraintsN[n].splice(indN, 1);
    this.rcnToConstraints();
};

Sudoku.prototype.findLargestConstrainment = function () {
    let currIndice = -1;
    let currIndiceConstraints = 10;
    for (let i = 0; i < 81; i++)
        if (this.constraints[i].length < currIndiceConstraints
            && this.constraints[i].length !== 0) {
            currIndice = i;
            currIndiceConstraints = this.constraints[i].length;
        }
    return currIndice;
};

Sudoku.prototype.solve = function () {
    if (this.needBacktrack) {
        this.needBacktrack = false;
        this.constraints = this.backtrackPoint.pop();
        this.val = this.backtrackVals.pop();
        console.log("Backtracked at this point with " + this.val);
    }
    else {
        let ind = this.findLargestConstrainment();
        if (ind === -1 && this.backtrackPoint.length === 0) this.complete = true;
        else if (ind !== -1) {
            if (!this.complete) {
                let iArr = this.constraints[ind];
                let va = iArr[0];
                if (iArr.length === 1) {
                    this.val[ind] = va;
                    iArr.shift();
                    this.upConstraints();
                }
                else {
                    let nCons = jQuery.extend(true, [], this.constraints);
                    let nVals = jQuery.extend(true, [], this.val);
                    this.backtrackPoint.push(nCons);
                    this.backtrackVals.push(nVals);
                    iArr.shift();
                    this.backtrackPoint[this.backtrackPoint.length - 1][ind] = iArr;

                    this.val[ind] = va;
                    this.upConstraints();
                }
                console.log("At indice: " + ind + " With remaining array: [" + iArr + "], we added in " + va + " [" + this.val + "]");
                console.log("backtrack points: " + this.backtrackPoint.length);
                console.log(this.constraints);
            }
        }
        else this.needBacktrack = true;
    }
};

function array_intersect() {let a,c,d,e,f,g=[],h={},i;i=arguments.length-1;d=arguments[0].length;c=0;for(a=0;a<=i;a++){e=arguments[a].length;if(e<d){c=a;d=e}}for(a=0;a<=i;a++){e=a===c?0:a||c;f=arguments[e].length;for(let j=0;j<f;j++){let k=arguments[e][j];if(h[k]===a-1){if(a===i){g.push(k);h[k]=0}else{h[k]=a}}else if(a===0){h[k]=0}}}return g}