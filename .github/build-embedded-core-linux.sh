#!/usr/bin/env bash
set -euxo pipefail

yum install -y perl-IPC-Cmd
curl -fsSL -o /tmp/db.tar.gz https://download.oracle.com/berkeley-db/db-5.3.28.tar.gz
echo 'e0a992d740709892e81f9d93f06daf305cf73fb81b545afe72478043172c3628  /tmp/db.tar.gz' | sha256sum -c
tar -xf /tmp/db.tar.gz -C /tmp
sed -i 's/__atomic_compare_exchange/__atomic_compare_exchange_db/g' /tmp/db-5.3.28/src/dbinc/atomic.h
cd /tmp/db-5.3.28/build_unix
../dist/configure --prefix=/tmp/bdb --enable-cxx --disable-shared --enable-static
make -j2
make install

curl -fsSL -o /tmp/openssl.tar.gz https://github.com/openssl/openssl/releases/download/openssl-3.5.9/openssl-3.5.9.tar.gz
echo '603f5602e2eef00d77fbd429d34dcd5822bb301757a1bc9cdb24c670f1eb859a  /tmp/openssl.tar.gz' | sha256sum -c
tar -xf /tmp/openssl.tar.gz -C /tmp
cd /tmp/openssl-3.5.9
./Configure linux-x86_64 no-shared --prefix=/tmp/ssl --libdir=lib
make -j2
make install_sw

cd /work/core-source
make -f makefile.cli -j2 \
  BDB_INCLUDE_PATH=/tmp/bdb/include \
  BDB_LIB_PATH=/tmp/bdb/lib \
  OPENSSL_INCLUDE_PATH=/tmp/ssl/include \
  OPENSSL_LIB_PATH=/tmp/ssl/lib \
  LIBS='/tmp/bdb/lib/libdb_cxx.a /tmp/ssl/lib/libssl.a /tmp/ssl/lib/libcrypto.a -ldl -lpthread -lz' \
  LDFLAGS='-static-libstdc++ -static-libgcc'
mkdir -p core
cp nexus core/nexus-linux-x64
file core/nexus-linux-x64
ldd core/nexus-linux-x64
strings core/nexus-linux-x64 | grep -E '^GLIBC_[0-9]' | sort -Vu | tail -1
