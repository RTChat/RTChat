// == Algorythm ==
// 1. HOST generates an distributes a random HOST_SALT to each VOTER.
// 2. VOTERs each generate a random SECRET_SALT, and determine a secret VOTE_STRING.
// 3. VOTERs each hash( HOST_SALT, SECRET_SALT, VOTE_STRING ) to compute the VERIFICATION_TOKEN.
// 4. VOTERs each transmit the VERIFICATION_TOKEN to the HOST. (and/or eachother)
// 5. time may pass, and voters may reveal who they voted for without others being able to change their vote.
// 6. VOTERs each transmit their SECRET_SALT, and VOTE_STRING to the HOST for verification.
// 7. HOST computes hash( HOST_SALT, SECRET_SALT, VOTE_STRING) and verifies that it results in the previously transmitted VERIFICATION_TOKEN.

// == Features ==
// 1. The HOST doesnt know what anyone votes without the SECRET_SALT.
// 2. The VERIFICATION_TOKEN proves that the voter voted, and "what" they voted for. (but cant be read directly)
// 3. The VERIFICATION_TOKEN can't be easily forged to allow for multiple different VOTE_STRINGs. (citation needed)

function multiHash(/* MultiArgs */) {
	console.log("arguments:", arguments)


}