module.exports = {
  'secret':'z|fw|3?AvY:v9xpJ=v$eqF,kcdXN_cC:[SZ4v]ZKaP9uoGL<"D@7On89:J$X|J$mUl4(o^=E%f(R#(oL:;v!kGq,2~n:%*NdgG}}jWH,}XNtrj=575=imQ(H6K~pKP+#{a:Av}*5b]<AA=oQd}f$wW7/T;GZ}dXz3aF}hE[)Qy"cR7n/64`";~c{3s15ijm)qz,kN%N',
  'authTokenExample':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inh5eiIsInJvbGUiOiJhZG1pbiIsIl9pZCI6IjU5ZTgxNmFkYzVhMzQ3MzYzMjg1MDdmZCIsImlhdCI6MTUwODM4MjQyNn0.Zs6DsMIBos-R0pse5dhccV6DFwY4XQ88C34zWH8Fq-o',
  'authTokenExampleNoAdmin':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5vQWRtaW4iLCJyb2xlIjoiZXhwZXJ0IiwiX2lkIjoiNTllODE2YWRjNWEzNDczNjMyODUwN2ZkIiwiaWF0IjoxNTA4MzgyNDI2fQ.oJOq5a2MxNwhpfKuWR3VNTVBA7CYscyC1U2frK2TZp4',
  'imageWidth':500,
  'mongoUrl': process.env.MONGODB_URI ||
              process.env.MONGOHQ_URL ||
              'mongodb://localhost:27017',
  'redisUrl': process.env.REDIS_URL || 
              'redis://127.0.0.1:6379/0'
};