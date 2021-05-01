let rhino3dm = require ('../../../libs/rhino3dm.min.js')
let fs = require ('fs');
let path = require ('path');

function GetThreeMeshesFrom3dm (rhino, rhinoFileName)
{
	let inputBuffer = fs.readFileSync (rhinoFileName, null).buffer;
	let inputArray = new Uint8Array (inputBuffer);
	let inputDoc = rhino.File3dm.fromByteArray (inputArray);
	let objects = inputDoc.objects ();
	let threeMeshes = [];
	for (let i = 0; i < objects.count; i++) {
		let mesh = objects.get (i).geometry ();
		if (mesh instanceof rhino.Mesh) {
			threeMeshes.push (mesh.toThreejsJSON ());
		}
	}
	return threeMeshes;
}

function WriteThreeMeshesTo3dm (rhino, threeMeshes, rhinoFileName)
{
	let outputDoc = new rhino.File3dm ();
	for (let i = 0; i < threeMeshes.length; i++) {
		let rhinoMesh = new rhino.Mesh.createFromThreejsJSON (threeMeshes[i]);
		outputDoc.objects ().add (rhinoMesh, null);
	}
	let writeOptions = new rhino.File3dmWriteOptions ();
	writeOptions.version = 6;
	let outputBuffer = outputDoc.toByteArray (writeOptions);
	fs.writeFileSync (rhinoFileName, outputBuffer);
}

function ReadWriteRhinoFile (rhinoIn, rhinoOut, inputRhinoFile, outputRhinoFile)
{
	let threeMeshes = GetThreeMeshesFrom3dm (rhinoIn, inputRhinoFile);
	console.log ('Meshes in ' + inputRhinoFile + ': ' + threeMeshes.length);
	WriteThreeMeshesTo3dm (rhinoOut, threeMeshes, outputRhinoFile);
}

if (!fs.existsSync ('output')){
	fs.mkdirSync ('output');
}

rhino3dm ().then (async function (rhinoIn) {
	rhino3dm ().then (async function (rhinoOut) {
		ReadWriteRhinoFile (rhinoIn, rhinoOut, 'input/one_cube.3dm', 'output/one_cube.3dm');
		ReadWriteRhinoFile (rhinoIn, rhinoOut, 'input/two_cubes.3dm', 'output/two_cubes.3dm');
		ReadWriteRhinoFile (rhinoIn, rhinoOut, 'input/three_cubes.3dm', 'output/three_cubes.3dm');
	});
});