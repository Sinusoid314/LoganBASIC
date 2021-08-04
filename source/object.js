class ObjNativeFunc
{
  constructor(ident, paramMin, paramMax, func)
  {
    this.ident = ident;
    this.paramMin = paramMin;
    this.paramMax = paramMax;
    this.func = func;
  }
}

class ObjArray
{
  constructor()
  {
    this.itemList = [];
    this.dimSizeList = [];
  }

  reDim(newDimSizeList)
  //Change the array dimensions
  {
    var newLinearSize = 1;

    for(var n = 0; n < newDimSizeList.length; n++)
    {
      if(newDimSizeList[n] <= 0)
        return false;

      newLinearSize *= newDimSizeList[n];
    }

    this.dimSizeList = newDimSizeList;
    this.itemList = new Array(newLinearSize).fill(0);

    return true;
  }

  getLinearIndex(indexList)
  //Convert the given index list to a linear index
  {
    var linearIndex = 0;
    var multiplier = 1;

    if(indexList.length != this.dimSizeList.length)
      return -1;

    for(var n = 0; n < this.dimSizeList.length; n++)
    {
      if((indexList[n] < 0) || (indexList[n] >= this.dimSizeList[n]))
        return -1;

      linearIndex += indexList[n] * multiplier;
      multiplier *= this.dimSizeList[n];
    }

    return linearIndex;
  }
}
