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
    this.items = [];
    this.dimSizes = [];
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

    this.dimSizes = newDimSizeList;
    this.items = new Array(newLinearSize).fill(0);

    return true;
  }

  getLinearIndex(indexList)
  //Convert the given index list to a linear index
  {
    var linearIndex = 0;
    var multiplier = 1;

    if(indexList.length != this.dimSizes.length)
      return -1;

    for(var n = 0; n < this.dimSizes.length; n++)
    {
      if((indexList[n] < 0) || (indexList[n] >= this.dimSizes[n]))
        return -1;

      linearIndex += indexList[n] * multiplier;
      multiplier *= this.dimSizes[n];
    }

    return linearIndex;
  }
}
