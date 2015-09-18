var RNG = function( seed ) {
	var m_w = seed;
	var m_z = 987654321;
	var mask = 0xffffffff;

	// Returns number between 0 (inclusive) and 1.0 (exclusive),
	// just like Math.random().
	this.random = function()
	{
	    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
	    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
	    var result = ((m_z << 16) + m_w) & mask;
	    result /= 4294967296;
	    return result + 0.5;
	}
}
